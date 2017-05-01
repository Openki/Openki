Template.discussion.onCreated(function() {
	subs.subscribe('discussion', this.data._id);
	this.posts = CourseDiscussions.find({
		courseId: this.data._id,
		parentId: { $exists: false },
	}, {
		sort: {time_created: -1, time_updated: -1}
	});
});

Template.discussion.helpers({
	havePosts: function() {
		return 0 < Template.instance().posts.count();
	},

	posts: function() {
		return Template.instance().posts;
	},

	newPost: function() {
		return {
			'new': true,
			courseId: this._id,
			userId: Meteor.userId(),
			text: ''
		};
	}
});


Template.post.onCreated(function() {
	// Note that the 'discussion' subscription from the 'discussion' template
	// covers responses as well
	this.responses = false;

	if (!this.data.new && !this.data.parentId) {
		this.responses = CourseDiscussions.find({
			parentId: this.data._id,
		}, {
			sort: {time_created: 1, time_updated: 1}
		});
	}

	this.editing = new ReactiveVar(false);
});


Template.post.helpers({
	responses: function() {
		return Template.instance().responses;
	},

	editing: function() {
		return Template.instance().editing.get();
	},

	allowResponse: function() {
		return !this.new && !this.parentId;
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


Template.postShow.helpers({
	postClass: function() {
		return this.parentId ? 'discussion-comment' : 'discussion-post';
	},

	mayEdit: function() {
		return mayEditPost(Meteor.user(), this);
	},

	mayDelete: function() {
		var course = Courses.findOne(this.courseId);
		return mayDeletePost(Meteor.user(), course, this);
	},
});


Template.postEdit.onCreated(function() {
	this.anon = new ReactiveVar(!this.data.userId);
	this.validComment = new ReactiveVar(CourseDiscussions.validComment(this.data.text));
});


Template.postEdit.helpers({
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
	}
});

Template.post.events({
	'click .js-discussion-edit': function(event, instance) {
		Tooltips.hide();
		event.stopImmediatePropagation();
		instance.editing.set(true);
	},

	'submit': function (event, instance) {
		event.stopImmediatePropagation();
		var comment = {
			title: instance.$(".js-post-title").val(),
			text: instance.$(".js-post-text").val()
		};

		var method = 'editComment';
		if (instance.data.new) {
			method = 'postComment';

			comment.courseId = instance.data.courseId;

			if (instance.data.parentId)	{
				comment.parentId = instance.data.parentId;
			}

			comment.anon = !!instance.$('.js-anon').prop('checked');
		} else {
			comment._id = instance.data._id;
		}

		Meteor.call(method, comment, function(err, commentId) {
			if (err) {
				showServerError('Posting your comment went wrong', err);
			} else {
				instance.editing.set(false);
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
		Meteor.call('deleteComment', this._id, function(err) {
			if (err) {
				showServerError('Could not delete comment', err);
			} else {
				addMessage("\u2713 " + mf('_message.removed'), 'success');
			}
		});
	},
});

Template.postEdit.rendered = function(){
	 Template.instance().$('.discussion-comment').slideDown();
};

Template.postEdit.events({
	'keyup .js-post-text, change .js-post-text': function(event, instance) {
		var text = instance.$(".js-post-text").val();
		instance.validComment.set(CourseDiscussions.validComment(text));
	},

	'change': function(event, instance) {
		instance.anon.set(instance.$('.js-anon').prop('checked'));
	}
});
