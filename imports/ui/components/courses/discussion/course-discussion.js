import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';

import Courses from '/imports/api/courses/courses';
import CourseDiscussions from '/imports/api/course-discussions/course-discussions';
import Alert from '/imports/api/alerts/alert';
import CourseDiscussionUtils from '/imports/utils/course-discussion-utils';
import { HasRoleUser } from '/imports/utils/course-role-utils';
import Editable from '/imports/ui/lib/editable';

import '/imports/ui/components/buttons/buttons';

import './course-discussion.html';

Template.discussion.onCreated(function () {
	this.count = new ReactiveVar(0);

	// If we want to jump to a comment we don't fold the comments
	const { select } = this.data;
	const limit = select ? 0 : 3;
	this.limit = new ReactiveVar(limit);

	this.sub = this.subscribe('discussion', this.data.courseId, () => {
		if (select) {
			// Wait for the templates to render before trying to jump there.
			Tracker.afterFlush(() => {
				// Jump to the selected comment.
				// This method should work for screenreaders too.
				window.location.hash = `#comment${select}`;
				RouterAutoscroll.scheduleScroll();
			});
		}
	});

	this.notifyAll = new ReactiveVar(false);
});

Template.discussion.helpers({
	ready() {
		return Template.instance().sub.ready();
	},

	posts() {
		const instance = Template.instance();
		let posts = CourseDiscussions.find(
			{
				courseId: this.courseId,
				parentId: { $exists: false },
			},
			{
				sort: { time_updated: -1 },
			},
		)
			.fetch();

		const count = posts.length;
		instance.count.set(count);

		const limit = instance.limit.get();
		if (limit) {
			posts = posts.slice(0, limit);
		}

		return posts;
	},

	newPost() {
		return {
			new: true,
			courseId: this.courseId,
			userId: Meteor.userId(),
			text: '',
			notifyAll: Template.instance().notifyAll.get(),
		};
	},

	limited() {
		const instance = Template.instance();
		const limit = instance.limit.get();

		if (limit) {
			return instance.count.get() > limit;
		}
		return false;
	},

	count() {
		return Template.instance().count.get();
	},
});

Template.discussion.events({
	'click .js-show-all-posts'(event, instance) {
		instance.limit.set(0);
	},
});

Template.post.onCreated(function () {
	const post = this.data;

	this.busy(false);

	this.isParent = !post.new && !post.parentId;
	this.editing = new ReactiveVar(false);

	this.limit = new ReactiveVar(2);
});


Template.post.helpers({
	editing() {
		return Template.instance().editing.get();
	},

	responses() {
		// Note that the 'discussion' subscription from the 'discussion' template
		// covers responses as well
		const instance = Template.instance();
		if (!instance.isParent) {
			return false;
		}

		const replies = CourseDiscussions
			.find(
				{ parentId: this._id },
				{ sort: { time_created: 1 } },
			)
			.fetch();

		const limit = instance.limit.get();
		return limit ? replies.slice(-(limit)) : replies;
	},

	notAllResponsesShown() {
		const instance = Template.instance();
		if (!instance.isParent) {
			return false;
		}

		const limit = instance.limit.get();
		const count = CourseDiscussions
			.find(
				{ parentId: this._id },
				{ limit: limit + 1 },
			)
			.count();

		return limit && count > limit;
	},

	count() {
		return Template.instance().count.get();
	},

	allowResponse() {
		return Template.instance().isParent;
	},

	newResponse() {
		if (this.parentId) {
			return false;
		}
		return {
			new: true,
			parentId: this._id,
			courseId: this.courseId,
			userId: Meteor.userId(),
			text: '',
		};
	},
});

Template.post.events({
	'click .js-show-previous-replies'(e, instance) {
		instance.limit.set(0);
	},
});


Template.postShow.helpers({
	postClasses() {
		const classes = [];

		classes.push(this.parentId ? 'discussion-comment' : 'discussion-post');
		if (this.saving) {
			classes.push('is-saving');
		}

		return { class: classes.join(' ') };
	},

	mayEdit() {
		return CourseDiscussionUtils.mayEditPost(Meteor.user(), this);
	},

	mayDelete() {
		const course = Courses.findOne(this.courseId);
		return CourseDiscussionUtils.mayDeletePost(Meteor.user(), course, this);
	},

	hasBeenEdited() {
		return moment(this.time_updated).isAfter(this.time_created);
	},
});

Template.postEdit.onCreated(function () {
	this.anon = new ReactiveVar(!this.data.userId);
	this.validComment = new ReactiveVar(CourseDiscussions.validComment(this.data.text));

	const placeholder = this.data.parentId
		? mf('course.discussion.text_placeholder_answer', 'Your answer')
		: mf('course.discussion.text_placeholder', 'Your comment');

	this.editableText = new Editable(false, false, placeholder, false);

	// UGLY: The event handler to save the comment is defined on the parent instance.
	// (Because that's where the editing-state flag is.) To make the text available
	// to the handler, we assign the editable on the parent. Improvements welcome.
	this.parentInstance().editableText = this.editableText;

	this.autorun(() => {
		this.editableText.setText(Template.currentData().text);
	});
});


Template.postEdit.helpers({
	editableText: () => Template.instance().editableText,

	postClass() {
		return this.parentId ? 'discussion-comment' : 'discussion-post';
	},

	showUserId() {
		return !this.new || !Template.instance().anon.get();
	},

	anonChecked() {
		if (Template.instance().anon.get()) {
			return { checked: 1 };
		}
		return {};
	},

	anonDisabled() {
		if (Meteor.user()) {
			return {};
		}
		return { disabled: 1 };
	},

	enableWhenValid() {
		return Template.instance().validComment.get() ? '' : 'disabled';
	},

	hasBeenEdited() {
		return moment(this.time_updated).isAfter(this.time_created);
	},

	notifyAllChecked() {
		if (!this.new) {
			return {};
		}
		if (this.notifyAll) {
			return { checked: 1 };
		}
		return {};
	},

	canNotifyAll() {
		if (Template.instance().anon.get()) {
			return false;
		}

		const course = Courses.findOne(this.courseId);
		if (!course) {
			return false;
		}

		const userId = Meteor.userId();
		return userId && HasRoleUser(course.members, 'team', userId);
	},
});

Template.post.events({
	'notifyAll .js-discussion-edit'(event, instance) {
		instance.$('.js-discussion-edit').click();
		instance.parentInstance().notifyAll.set(true);
		window.location.hash = '#discussion';
		RouterAutoscroll.scheduleScroll();
	},

	'click .js-discussion-edit'(event, instance) {
		Tooltips.hide();
		event.stopImmediatePropagation();
		instance.editing.set(true);
	},

	submit(event, instance) {
		event.stopImmediatePropagation();

		const comment = { title: instance.$('.js-post-title').val() };

		const editedText = instance.editableText.getEdited();
		if (editedText) {
			comment.text = editedText;
		}

		let method = 'courseDiscussion.editComment';
		if (instance.data.new) {
			method = 'courseDiscussion.postComment';

			comment.courseId = instance.data.courseId;

			if (instance.data.parentId) {
				comment.parentId = instance.data.parentId;
			}

			comment.anon = instance.$('.js-anon').prop('checked');
			comment.notifyAll = instance.$('.js-notify-all').prop('checked');
		} else {
			comment._id = instance.data._id;
		}

		instance.editing.set(false);
		instance.busy('saving');
		Meteor.call(method, comment, (err) => {
			instance.busy(false);
			if (err) {
				Alert.serverError(err, 'Posting your comment went wrong');
			}
		});

		return false;
	},

	'click .js-discussion-cancel'() {
		Template.instance().editing.set(false);
	},

	'click button.js-delete-comment'(event) {
		Tooltips.hide();
		event.stopImmediatePropagation();
		Meteor.call('courseDiscussion.deleteComment', this._id, (err) => {
			if (err) {
				Alert.serverError(err, 'Could not delete comment');
			} else {
				Alert.success(mf('discussionPost.deleted', 'Comment has been deleted.'));
			}
		});
	},
});

Template.postEdit.onRendered(function postEditOnRendered() {
	this.$('.discussion-edit-title').select();
});

Template.postEdit.events({
	'keyup .js-post-text, change .js-post-text'(event, instance) {
		const edited = instance.editableText.getEdited();
		instance.validComment.set(edited && CourseDiscussions.validComment(edited));
	},

	change(event, instance) {
		instance.anon.set(instance.$('.js-anon').prop('checked'));
	},
});

Template.profileIcon.helpers({

	discussionLogo() {
		return Meteor.settings.public.discussionLogo?.src;
	},

	discussionAlt() {
		return Meteor.settings.public.discussionLogo?.alt;
	},

});
