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
		// loop over first-level post, search each post for comments, order by most recent
		posts.forEach(function (post){
			ordered_posts.push(post);
			var comments = CourseDiscussions.find({
				parent_ID: post._id},
				{sort: {time_created: 1}});
			comments.forEach(function (comment){
				ordered_posts.push(comment);
			});
		});
		//return array with proper order
		return ordered_posts;
	}
});

Template.newPost.created = function() {
	this.writing = new ReactiveVar(false);
	this.editing = new ReactiveVar(false);
}

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
		if (pleaseLogin()) return;
		Template.instance().writing.set(true);

	},

	'click button.add': function () {
		if (pleaseLogin()) return;
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

		var templateInstance = Template.instance();
		Meteor.call('postComment', comment, function(err, commentId) {
			if (err) {
				addMessage(mf('comment.saving.error', { ERROR: err }, 'Posting your comment went wrong! Sorry about this. We encountered the following error: {ERROR}'), 'danger');
			} else {
				console.log(Template.instance())
				templateInstance.writing.set(false);
			}
		});

	},

	'click button.cancel': function () {
		Template.instance().writing.set(false);
	},

	'click button.edit': function () {
		if (pleaseLogin()) return;
		Template.instance().editing.set(true);
		$("#edit_text").val( this.parent.text );
		$("#edit_title").val( this.parent.title );
		Template.instance().editing.set(true);

	},

	'click button.cancelEdit': function () {
		if (pleaseLogin()) return;
		Template.instance().editing.set(false);
		$('form[name=form_edit]').hide();
	},
	'click button.update': function () {
		if (pleaseLogin()) return;
		var comment = {
			text: $("#edit_text").val(),
			title: $("#edit_title").val()

		};

		//var parent_ID = this.parent && this.parent._id;
		//if (parent_ID) {
		//comment.parent_ID = parent_ID;
		comment.course_ID = this.parent.course_ID;
		//} else {
		//	comment.course_ID = this._id;
		//}

		var templateInstance = Template.instance();
		Meteor.call('editComment', comment, this.parent._id, function(err, commentId) {
			if (err) {
				addMessage(mf('comment.editing.error', { ERROR: err }, 'Editing your comment went wrong! Sorry about this. We encountered the following error: {ERROR}'), 'danger');
			} else {
				templateInstance.editing.set(false);
			}
		});


	}

});
