import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';

import Courses from '/imports/api/courses/courses.js';
import CourseDiscussions from '/imports/api/course-discussions/course-discussions.js';
import ShowServerError from '/imports/ui/lib/show-server-error.js';
import { AddMessage } from '/imports/api/messages/methods.js';
import CourseDiscussionUtils from '/imports/utils/course-discussion-utils.js';
import { HasRoleUser } from '/imports/utils/course-role-utils.js';
import Editable from '/imports/ui/lib/editable.js';

import '/imports/ui/components/buttons/buttons.js';

import './course-discussion.html';

Template.discussion.onCreated(function() {
	this.count = new ReactiveVar(0);

	// If we want to jump to a comment we don't fold the comments
	var select = this.data.select;
	var limit = select ? 0 : 3;
	this.limit = new ReactiveVar(limit);

	this.sub = this.subscribe('discussion', this.data.courseId, function() {
		if (select) {
			// Wait for the templates to render before trying to jump there.
			Tracker.afterFlush(function() {
				// Jump to the selected comment.
				// This method should work for screenreaders too.
				location.hash = '#comment' + select;
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

	posts: function() {
		var instance = Template.instance();
		var posts = CourseDiscussions.find(
			{
				courseId: this.courseId,
				parentId: { $exists: false }
			},
			{
				sort: { time_updated: -1 }
			})
			.fetch();

		var count = posts.length;
		instance.count.set(count);

		var limit = instance.limit.get();
		if (limit) posts = posts.slice(0, limit);

		return posts;
	},

	newPost: function() {
		return {
			'new': true,
			courseId: this.courseId,
			userId: Meteor.userId(),
			text: '',
			notifyAll: Template.instance().notifyAll.get()
		};
	},

	limited: function() {
		var instance = Template.instance();
		var limit = instance.limit.get();

		if (limit) return instance.count.get() > limit;
	},

	count: function() {
		return Template.instance().count.get();
	}
});

Template.discussion.events({
	'click .js-show-all-posts': function(e, instance) {
		 instance.limit.set(0);
	}
});


Template.post.onCreated(function() {
	var post = this.data;

	this.busy(false);

	this.isParent = !post.new && !post.parentId;
	this.editing = new ReactiveVar(false);

	this.limit = new ReactiveVar(2);
});


Template.post.helpers({
	editing: function() {
		return Template.instance().editing.get();
	},

	responses: function() {
		// Note that the 'discussion' subscription from the 'discussion' template
		// covers responses as well
		const instance = Template.instance();
		if (!instance.isParent) return;

		const replies =
			CourseDiscussions
			.find(
				{ parentId: this._id },
				{ sort: { time_created: 1 }	}
			)
			.fetch();

		const limit = instance.limit.get();
		return limit ? replies.slice(-(limit)) : replies;
	},

	notAllResponsesShown: function() {
		const instance = Template.instance();
		if (!instance.isParent) return;

		const limit = instance.limit.get();
		const count =
			CourseDiscussions
			.find(
				{ parentId: this._id },
				{ limit: limit + 1 }
			)
			.count();

		return limit && count > limit;
	},

	count: function() {
		return Template.instance().count.get();
	},

	allowResponse: function() {
		return Template.instance().isParent;
	},

	newResponse: function() {
		if (this.parentId) return false;
		return {
			new: true,
			parentId: this._id,
			courseId: this.courseId,
			userId: Meteor.userId(),
			text: '',
		};
	}
});

Template.post.events({
	'click .js-show-previous-replies'(e, instance) {
		instance.limit.set(0);
	}
});


Template.postShow.helpers({
	postClasses() {
		const classes = [];

		classes.push(this.parentId ? 'discussion-comment' : 'discussion-post');
		if (this.saving) classes.push('is-saving');

		return { class: classes.join(' ')};
	},

	mayEdit: function() {
		return CourseDiscussionUtils.mayEditPost(Meteor.user(), this);
	},

	mayDelete: function() {
		var course = Courses.findOne(this.courseId);
		return CourseDiscussionUtils.mayDeletePost(Meteor.user(), course, this);
	},

	hasBeenEdited: function() {
		 return moment(this.time_updated).isAfter(this.time_created);
	}
});


Template.postEdit.onCreated(function() {
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
	editableText: () => {
		return Template.instance().editableText;
	},

	postClass: function() {
		return this.parentId ? 'discussion-comment' : 'discussion-post';
	},

	showUserId: function() {
		return !this.new || !Template.instance().anon.get();
	},

	anonChecked: function() {
		if (Template.instance().anon.get()) {
			return { checked: 1};
		}
		return {};
	},

	anonDisabled: function() {
		if (Meteor.user()) return {};
		return { disabled: 1 };
	},

	enableWhenValid: function() {
		return Template.instance().validComment.get() ? '' : 'disabled';
	},

	hasBeenEdited: function() {
		 return moment(this.time_updated).isAfter(this.time_created);
	},

	notifyAllChecked: function() {
		if (!this.new) return {};
		if (this.notifyAll) {
			return { checked: 1};
		}
		return {};
	},

	canNotifyAll: function() {
		if (Template.instance().anon.get()) return false;

		const course = Courses.findOne(this.courseId);
		if (!course) return false;

		const userId = Meteor.userId();
		return userId && HasRoleUser(course.members, 'team', userId);
	}
});

Template.post.events({
	'notifyAll .js-discussion-edit'(event, instance) {
		instance.$('.js-discussion-edit').click();
		instance.parentInstance().notifyAll.set(true);
		location.hash = '#discussion';
		RouterAutoscroll.scheduleScroll();
	},

	'click .js-discussion-edit': function(event, instance) {
		Tooltips.hide();
		event.stopImmediatePropagation();
		instance.editing.set(true);
	},

	'submit': function (event, instance) {
		event.stopImmediatePropagation();

		var comment = { title: instance.$(".js-post-title").val() };

		const editedText = instance.editableText.getEdited();
		if (editedText) {
			comment.text = editedText;
		}

		var method = 'courseDiscussion.editComment';
		if (instance.data.new) {
			method = 'courseDiscussion.postComment';

			comment.courseId = instance.data.courseId;

			if (instance.data.parentId)	{
				comment.parentId = instance.data.parentId;
			}

			comment.anon = !!instance.$('.js-anon').prop('checked');
			comment.notifyAll = !!instance.$('.js-notify-all').prop('checked');
		} else {
			comment._id = instance.data._id;
		}

		instance.editing.set(false);
		instance.busy('saving');
		Meteor.call(method, comment, function(err, commentId) {
			instance.busy(false);
			if (err) {
				ShowServerError('Posting your comment went wrong', err);
			}
		});

		return false;
	},

	'click .js-discussion-cancel': function() {
		Template.instance().editing.set(false);
	},

	'click button.js-delete-comment': function (event, instance) {
		Tooltips.hide();
		event.stopImmediatePropagation();
		Meteor.call('courseDiscussion.deleteComment', this._id, function(err) {
			if (err) {
				ShowServerError('Could not delete comment', err);
			} else {
				AddMessage("\u2713 " + mf('_message.removed'), 'success');
			}
		});
	},
});

Template.postEdit.onRendered(function postEditOnRendered(){
	this.$('.discussion-edit-title').select();
});

Template.postEdit.events({
	'keyup .js-post-text, change .js-post-text': function(event, instance) {
		const edited = instance.editableText.getEdited();
		instance.validComment.set(edited && CourseDiscussions.validComment(edited));
	},

	'change': function(event, instance) {
		instance.anon.set(instance.$('.js-anon').prop('checked'));
	}
});
