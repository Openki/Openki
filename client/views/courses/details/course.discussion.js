Template.discussion.onCreated(function() {
	subs.subscribe('discussion', this.data._id);
	this.posts = CourseDiscussions.find({
		courseId: this.data._id,
		parentId: { $exists: false },
	}, {
		sort: {time_updated: -1, time_created: -1}
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
			userId: Meteor.userId()
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
			sort: {time_updated: 1, time_created: 1}
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
			userId: Meteor.userId()
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
});

Template.post.events({
	'click .-edit': function(event, instance) {
		event.stopImmediatePropagation();
		instance.editing.set(true);
	},

	'click button.post': function (event, instance) {
		event.stopImmediatePropagation();
		var comment = {
			title: instance.$(".-postTitle").val(),
			text: instance.$(".-postText").val()
		};

		var method = 'editComment';
		if (instance.data.new) {
			method = 'postComment';

			comment.courseId = instance.data.courseId;

			if (instance.data.parentId)	{
				comment.parentId = instance.data.parentId;
			}

			comment.anon = !!instance.$('.toggleAnonymous').prop('checked');
		} else {
			comment._id = instance.data._id;
		}

		Meteor.call(method, comment, function(err, commentId) {
			if (err) {
				addMessage(mf('comment.saving.error', { ERROR: err }, 'Posting your comment went wrong! Sorry about this. We encountered the following error: {ERROR}'), 'danger');
			} else {
				instance.editing.set(false);
			}
		});

	},

	'click button.cancel': function() {
		Template.instance().editing.set(false);
	},

	'click button.delete': function (event, instance) {
		event.stopImmediatePropagation();
		if (confirm(mf( 'comment.delete.confirm','Really delete comment?' ))) {
			Meteor.call('deleteComment', this._id, function(err) {
				if (err) {
					addMessage(mf('comment.delete.error', { ERROR: err }, 'Could not delete comment. Reason: {ERROR}'), 'danger');
				} else {
					addMessage(mf('comment.delete.success', {}, 'Commend deleted successfuly.'), 'success');
				}
			});
		}
	},
});

Template.postEdit.events({
	'change': function(event, instance) {
		instance.anon.set(instance.$('.toggleAnonymous').prop('checked'));
	}
});
