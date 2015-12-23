//load template-content
Template.discussion.helpers({
	post: function() {
		//get all first-level posts
		var posts = CourseDiscussions.find({
			course_ID: this._id,
			parent_ID: { $exists: false },
			},
			{sort: {time_updated: -1, time_created: -1}}
		);
		var ordered_posts = [];
		var course = Courses.findOne( {_id:this._id  } );
		var currentUser = Meteor.user();
		
		
		// loop over first-level post, search each post for comments, order by most recent
		posts.forEach(function (post){

			post.editableByUser = false;
			post.deletableByUser = false;
			if( mayDeletePost( currentUser, course, post) ){
				post.deletableByUser = true;
			}
			if( mayEditPost( currentUser, post) ){
				post.editableByUser = true;
			}
			
			
			ordered_posts.push(post);
			var comments = CourseDiscussions.find({
				parent_ID: post._id},
				{sort: {time_created: 1}});
			
			comments.forEach(function (comment){
			
				//check comment permissions as well, may not be the same as post permissions
				
				comment.editableByUser = false;
				comment.deletableByUser = false;
				if( mayDeletePost( currentUser, course, comment) ){
					comment.deletableByUser = true;
				}
				if( mayEditPost( currentUser, comment) ){
					comment.editableByUser = true;
				}
			
				ordered_posts.push(comment);
			});
						
		});
		//return array with proper order
		return ordered_posts;
	},
	editing: function() {
		return Template.instance().editing.get();
	},
	equals: function (a, b) {
      	return a === b;
    }
});


Template.writePostDialog.helpers({
	anonChecked: function() {
		if (Meteor.user()) return {};
		return { checked: 1, disabled: 1 };
	}
});


Template.newPost.onCreated(function() {
	this.writing = new ReactiveVar(false);
	this.editing = new ReactiveVar(false);
});


Template.newPost.helpers({
	writing: function() {
		return Template.instance().writing.get();
	},
	editing: function() {
		return Template.instance().editing.get();
	}
});

Template.newPost.events({
	'click button.write': function () {
		Template.instance().writing.set(true);
	},

	'click button.add': function (event, instance) {
		var comment = {
			title: $("#post_title").val(),
			text: $("#post_text").val()
		};
		var parent_ID = this.parent && this.parent._id;
		if (parent_ID) {
			comment.parent_ID = parent_ID;
			comment.course_ID = this.parent.course_ID;
		} else {
			comment.course_ID = this._id;
		}

		var anon = instance.$('.-anon').prop('checked');
		Meteor.call('postComment', comment, anon, function(err, commentId) {
			if (err) {
				addMessage(mf('comment.saving.error', { ERROR: err }, 'Posting your comment went wrong! Sorry about this. We encountered the following error: {ERROR}'), 'danger');
			} else {
				instance.writing.set(false);
			}
		});

	},

	'click button.cancel': function () {
		Template.instance().writing.set(false);
	},
	'click button.edit': function () {
		if (pleaseLogin()) return;
		Template.instance().editing.set(true);
		var postSelector = 'div#post-' + this.parent._id + ' div.post-text';
		$(postSelector).hide();
	},
	'click button.cancelEdit': function () {
		if (pleaseLogin()) return;
		Template.instance().editing.set(false);
		$('form[name=form_edit]').hide();
		$('div.post-text').show();
	},
	'click button.update': function () {
		if (pleaseLogin()) return;
				
		var comment = {
			text: $("#edit_text").val(),
			title: $("#edit_title").val()

		};
		
		comment.course_ID = this.parent.course_ID;
		comment.user_ID = this.parent.user_ID;

		var templateInstance = Template.instance();
		Meteor.call('editComment', comment, this.parent._id, function(err, commentId) {
			if (err) {
				addMessage(mf('comment.editing.error', { ERROR: err }, 'Editing your comment went wrong! Sorry about this. We encountered the following error: {ERROR}'), 'danger');
			} else {
				templateInstance.editing.set(false);
			}
		});
		
		$('div.post-text').show();
		
	},
	'click button.deletePost': function () {
		if (pleaseLogin()) return;
		
		if (confirm(mf( 'comment.delete.confirm','Really delete comment?' ) ) ){
		
			Meteor.call('deleteComment', this.parent._id, function(err, commentId) {
				if (err) {
					addMessage(mf('comment.delete.error', { ERROR: err }, 'Could not delete comment. Reason: {ERROR}'), 'danger');
				}
			});
			
		}
	},


});


Template.discussion.onCreated(function() {
	this.editing = new ReactiveVar(false);
});

//handling events for comments for a given post
Template.discussion.events({

	'click button.editAnswer': function () {
		if (pleaseLogin()) return;
		Template.instance().editing.set(this._id);
		console.log(Template.instance().editing);

	},
	'click button.cancelEdit': function () {
		if (pleaseLogin()) return;
		Template.instance().editing.set(false);
		$('form[name=form_edit]').hide();
	},
	'click button.updateAnswer': function () {
		if (pleaseLogin()) return;
		
		var selector = "div#edit-comment-" + this._id;
		
		var comment = {
			text: $(selector + " #edit_text").val(),
			title: $(selector + " #edit_title").val()
		};
		
		comment.course_ID = this.course_ID;
		comment.parent_ID = this.parent_ID;

		var templateInstance = Template.instance();
		Meteor.call('editComment', comment, this._id, function(err, commentId) {
			if (err) {
				addMessage(mf('comment.editing.error', { ERROR: err }, 'Editing your comment went wrong! Sorry about this. We encountered the following error: {ERROR}'), 'danger');
			} else {
				templateInstance.editing.set(false);
			}
		});

	},
	'click button.deleteAnswer': function () {
		if (pleaseLogin()) return;
		
		if (confirm(mf( 'comment.delete.confirm','Really delete comment?' ) ) ){
		
			Meteor.call('deleteComment', this._id, function(err, commentId) {
				if (err) {
					addMessage(mf('comment.delete.error', { ERROR: err }, 'Could not delete comment. Reason: {ERROR}'), 'danger');
				}
			});
		}
	},
});

