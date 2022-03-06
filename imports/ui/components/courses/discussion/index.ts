import { Tooltips } from 'meteor/lookback:tooltips';
import { Meteor } from 'meteor/meteor';
import { i18n } from '/imports/startup/both/i18next';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { Tracker } from 'meteor/tracker';
import moment from 'moment';

import { Courses } from '/imports/api/courses/courses';
import {
	CourseDiscussionEnity,
	CourseDiscussions,
} from '/imports/api/course-discussions/course-discussions';
import * as CourseDiscussionsMethods from '/imports/api/course-discussions/methods';
import { EditCommentFields, PostCommentFields } from '/imports/api/course-discussions/methods';
import * as Alert from '/imports/api/alerts/alert';
import * as CourseDiscussionUtils from '/imports/utils/course-discussion-utils';
import { Editable } from '/imports/ui/lib/editable';
import RouterAutoscroll from '/imports/ui/lib/router-autoscroll';

import '/imports/ui/components/buttons';
import '/imports/ui/components/avatar';
import '/imports/ui/components/profile-link';

import './template.html';
import './styles.scss';

{
	const Template = TemplateAny as TemplateStaticTyped<
		'discussion',
		{ select: string; courseId: string },
		{
			count: ReactiveVar<number>;
			limit: ReactiveVar<number>;
			sub: Meteor.SubscriptionHandle;
			notifyAll: ReactiveVar<boolean>;
		}
	>;

	const template = Template.discussion;

	template.onCreated(function () {
		const instance = this;

		instance.count = new ReactiveVar(0);

		// If we want to jump to a comment we don't fold the comments
		const { select } = instance.data;
		const limit = select ? 0 : 3;
		instance.limit = new ReactiveVar(limit);

		instance.sub = instance.subscribe('discussion', instance.data.courseId, () => {
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

		instance.notifyAll = new ReactiveVar(false);
	});

	template.helpers({
		ready() {
			return Template.instance().sub.ready();
		},

		posts() {
			const instance = Template.instance();
			const data = Template.currentData();

			let posts = CourseDiscussions.find(
				{
					courseId: data.courseId,
					parentId: { $exists: false },
				},
				{
					sort: { time_updated: -1 },
				},
			).fetch();

			const count = posts.length;
			instance.count.set(count);

			const limit = instance.limit.get();
			if (limit) {
				posts = posts.slice(0, limit);
			}

			return posts;
		},

		newPost() {
			const instance = Template.instance();
			const data = Template.currentData();

			return {
				new: true,
				courseId: data.courseId,
				userId: Meteor.userId(),
				text: '',
				notifyAll: instance.notifyAll.get(),
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

	template.events({
		'click .js-show-all-posts'(_event, instance) {
			instance.limit.set(0);
		},
	});
}

{
	const Template = TemplateAny as TemplateStaticTyped<
		'post',
		CourseDiscussionEnity & { new?: true },
		{ isParent: boolean; editing: ReactiveVar<boolean>; limit: ReactiveVar<number> }
	>;

	const template = Template.post;

	template.onCreated(function () {
		const instance = this;
		const post = instance.data;

		instance.busy(false);

		instance.isParent = !post.new && !post.parentId;
		instance.editing = new ReactiveVar(false);

		instance.limit = new ReactiveVar(2);
	});

	template.helpers({
		editing() {
			return Template.instance().editing.get();
		},

		responses() {
			// Note that the 'discussion' subscription from the 'discussion' template
			// covers responses as well
			const instance = Template.instance();
			const post = Template.currentData();

			if (!instance.isParent) {
				return false;
			}

			const replies = CourseDiscussions.find(
				{ parentId: post._id },
				{ sort: { time_created: 1 } },
			).fetch();

			const limit = instance.limit.get();
			return limit ? replies.slice(-limit) : replies;
		},

		notAllResponsesShown() {
			const instance = Template.instance();
			const post = Template.currentData();

			if (!instance.isParent) {
				return false;
			}

			const limit = instance.limit.get();
			const count = CourseDiscussions.find({ parentId: post._id }, { limit: limit + 1 }).count();

			return limit && count > limit;
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

	template.events({
		'click .js-show-previous-replies'(_event, instance) {
			instance.limit.set(0);
		},

		'click .js-discussion-cancel'() {
			Template.instance().editing.set(false);
		},

		async 'click button.js-delete-comment'(event) {
			const post = Template.currentData();

			Tooltips.hide();
			event.stopImmediatePropagation();

			try {
				await CourseDiscussionsMethods.deleteComment(post._id);
				Alert.success(i18n('discussionPost.deleted', 'Comment deleted.'));
			} catch (err) {
				Alert.serverError(err, 'Could not delete comment');
			}
		},
	});
}

{
	const Template = TemplateAny as TemplateStaticTyped<'postShow', CourseDiscussionEnity>;

	const template = Template.postShow;

	template.helpers({
		postClasses() {
			const post = Template.currentData();

			const classes = [];

			classes.push(post.parentId ? 'discussion-comment' : 'discussion-post');
			if (this.saving) {
				classes.push('is-saving');
			}

			return { class: classes.join(' ') };
		},

		mayEdit() {
			const post = Template.currentData();
			return CourseDiscussionUtils.mayEditPost(Meteor.user(), post);
		},

		mayDelete() {
			const post = Template.currentData();
			const course = Courses.findOne(post.courseId);
			if (!course) {
				throw new Error('Unexpected falsy: course');
			}
			return CourseDiscussionUtils.mayDeletePost(Meteor.user(), course, post);
		},

		hasBeenEdited() {
			const post = Template.currentData();
			return moment(post.time_updated).isAfter(post.time_created);
		},
	});

	template.events({
		'notifyAll .js-discussion-edit'(_event, instance) {
			instance.$('.js-discussion-edit').trigger('click');
			(instance.parentInstance(2) as any).notifyAll.set(true);
			window.location.hash = '#discussion';
			RouterAutoscroll.scheduleScroll();
		},

		'click .js-discussion-edit'(event, instance) {
			Tooltips.hide();
			event.stopImmediatePropagation();
			(instance.parentInstance() as any).editing.set(true);
		},
	});
}

{
	const Template = TemplateAny as TemplateStaticTyped<
		'postEdit',
		CourseDiscussionEnity & { new?: true },
		{ anon: ReactiveVar<boolean>; validComment: ReactiveVar<boolean>; editableText: Editable }
	>;

	const template = Template.postEdit;

	template.onCreated(function () {
		const instance = this;

		instance.anon = new ReactiveVar(!instance.data.userId);
		instance.validComment = new ReactiveVar(CourseDiscussions.validComment(instance.data.text));

		const placeholder = instance.data.parentId
			? i18n('course.discussion.text_placeholder_answer', 'Your answer')
			: i18n('course.discussion.text_placeholder', 'Your comment');

		instance.editableText = new Editable(false, placeholder);

		// UGLY: The event handler to save the comment is defined on the parent instance.
		// (Because that's where the editing-state flag is.) To make the text available
		// to the handler, we assign the editable on the parent. Improvements welcome.
		(instance.parentInstance() as any).editableText = instance.editableText;

		instance.autorun(() => {
			instance.editableText.setText(Template.currentData().text);
		});
	});
	template.onRendered(function () {
		const instance = this;
		instance.$('.discussion-edit-title').trigger('select');
	});

	template.helpers({
		editableText() {
			return Template.instance().editableText;
		},

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
			const post = Template.currentData();
			return moment(post.time_updated).isAfter(post.time_created);
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

			return !!course?.userHasRole(Meteor.userId(), 'team');
		},
	});

	template.events({
		'keyup .js-post-text, change .js-post-text'(_event, instance) {
			const edited = instance.editableText.getEdited();
			instance.validComment.set(!!edited && CourseDiscussions.validComment(edited));
		},

		change(_event, instance) {
			instance.anon.set(instance.$('.js-anon').prop('checked'));
		},

		async submit(event, instance) {
			event.stopImmediatePropagation();
			event.preventDefault();

			let comment = { title: instance.$('.js-post-title').val() as string } as
				| PostCommentFields
				| EditCommentFields;

			const editedText = instance.editableText.getEdited();
			if (editedText) {
				comment.text = editedText;
			}

			(instance.parentInstance() as any).editing.set(false);
			instance.busy('saving');

			try {
				if (instance.data.new) {
					comment = comment as PostCommentFields;
					comment.courseId = instance.data.courseId;

					if (instance.data.parentId) {
						comment.parentId = instance.data.parentId;
					}

					comment.anon = instance.$('.js-anon').prop('checked');
					comment.notifyAll = instance.$('.js-notify-all').prop('checked') || false;

					await CourseDiscussionsMethods.postComment(comment);
				} else {
					comment = comment as EditCommentFields;
					comment._id = instance.data._id;
					await CourseDiscussionsMethods.editComment(comment);
				}
			} catch (err) {
				Alert.serverError(err, 'Posting your comment went wrong');
			} finally {
				instance.busy(false);
			}
		},
	});
}
