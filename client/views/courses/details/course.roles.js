Template.roleDetail.created = function() {
	this.enrolling = new ReactiveVar(false);
}

Template.roleDetail.helpers({
	enrolling: function() { return Template.instance().enrolling.get() }
})

Template.roleDetail.events({
	'click button.enrol': function(e, template) {
		if(!Meteor.userId()) {
			alert("Please log in!");
			return;
		}
		template.enrolling.set(true);
		return false;
	},
	
	'click button.subscribe': function (e, template) {
		if (template.find('.incognito')) {
			var incognito = $(template.find('.incognito')).prop('checked');
		} else incognito = false
		Meteor.call("change_subscription", this.course._id, this.roletype.type, true, incognito);
		
		// Store the comment
		var comment = $(template.find('.comment')).val();
		Meteor.call("change_comment", this.course._id, comment);
		template.enrolling.set(false);
		return false;
	},

	'click button.cancel': function (e, template) {
		template.enrolling.set(false);
		return false;
	},

	'click input.unsubscribe': function () {
		Meteor.call("change_subscription", this.course._id, this.roletype.type, false, false, null);
		return false;
	}
});

Template.memberRoles.helpers({
	editableMessage: function() {
		var course = this.course;
		if (this.member.user !== Meteor.userId()) return false;
		return makeEditable(
			this.member.comment, 
			true,
			function(newMessage) {
				Meteor.call("change_comment", course._id, newMessage, function(err, courseId) {
					if (err) {
						addMessage(mf('subscribemessage.saving.error', { ERROR: err }, 'Unable to change your message. We encountered the following error: {ERROR}'));
					} else {
						addMessage(mf('subscribemessage.saving.success', { NAME: course.name }, 'Changed your message on {NAME}'));
					}
				});
			}
		);
	}
});