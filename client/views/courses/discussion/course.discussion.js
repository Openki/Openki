Template.discussion.onCreated(function() {
	this.count = new ReactiveVar(0);

	// If we want to jump to a comment we don't fold the comments
	var select = this.data.select;
	var limit = select ? 0 : 3;
	this.limit = new ReactiveVar(limit);

	subs.subscribe('discussion', this.data.courseId, function() {
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

});

Template.discussion.helpers({
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
			text: ''
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

	this.isParent = !post.new && !post.parentId;
	this.count = new ReactiveVar(0);
	this.editing = new ReactiveVar(false);

	this.initialLimit = 1;
	this.limit = new ReactiveVar(this.initialLimit);
});


Template.post.helpers({
	editing: function() {
		return Template.instance().editing.get();
	},

	responses: function() {
		// Note that the 'discussion' subscription from the 'discussion' template
		// covers responses as well
		var instance = Template.instance();
		var responses = false;

		if (instance.isParent) {
			var limit = instance.limit.get();

			// if only one response is shown, show newest
			var sort = limit ? -1 : 1;

			responses = CourseDiscussions.find(
				{ parentId: this._id },
				{ sort: { time_updated: sort } })
				.fetch();

			var count = responses.length;
			instance.count.set(count);

			if (limit) responses = responses.slice(0, limit);
		}

		return responses;
	},

	responsesLimited: function() {
		var instance = Template.instance();
		var limit = instance.limit.get();

		return instance.count.get() > limit;
	},

	allResponsesShown: function() {
		return !Template.instance().limit.get();
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
	'click .js-toggle-all-responses': function(e, instance) {
		var limit = instance.limit;
		var newLimit = (limit.get() === 0) ? instance.initialLimit : 0;

		limit.set(newLimit);
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

	hasBeenEdited: function() {
		 return moment(this.time_updated).isAfter(this.time_created);
	}
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
	},

	hasBeenEdited: function() {
		 return moment(this.time_updated).isAfter(this.time_created);
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
