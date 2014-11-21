Template.roleComment.created = function() {
	this.editing = new ReactiveVar;
	this.editing.set(false)
}

Template.roleComment.helpers({
	editing: function() { return Template.instance().editing.get() }
})

Template.roleComment.events({
	'keyup .comment, change .comment': function(e, template) {
		template.editing.set(true);
	},
	
	'click input.save': function(e, template) {
		var comment = $(template.find('.comment')).val();
		Meteor.call("change_comment", this.course._id, comment);
		template.editing.set(false);
		e.preventDefault();
	},
	
	'click input.reset': function (e, template) {
		template.find('.comment').val("" + template.data.comment);
		template.editing.set(false);
	},
});


Template.roleDetail.created = function() {
	this.enrolling = new ReactiveVar;
	this.enrolling.set(false)
}

Template.roleDetail.helpers({
	enrolling: function() { return Template.instance().enrolling.get() }
})

Template.roleDetail.events({
	'click input.enrol': function(e, template) {
		if(!Meteor.userId()) {
			alert("Please log in!");
			return;
		}
		template.enrolling.set(true);
		return false;
	},
	
	'click input.subscribe': function (e, template) {
		Meteor.call("change_subscription", this.course._id, this.roletype.type, true, false);
		var comment = $(template.find('.comment')).val();
		Meteor.call("change_comment", this.course._id, comment);
		template.enrolling.set(false);
		return false;
	},

	'click input.subscribeAnon': function (e, template) {
		Meteor.call("change_subscription", this.course._id, this.roletype.type, true, true);
		var comment = $(template.find('.comment')).val();
		Meteor.call("change_comment", this.course._id, comment);
		template.enrolling.set(false);
		return false;
	},

	'click input.cancel': function (e, template) {
		template.enrolling.set(false);
		return false;
	},

	'click input.unsubscribe': function () {
		Meteor.call("change_subscription", this.course._id, this.roletype.type, false, false, null);
		return false;
	}
})