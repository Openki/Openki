Template.member_roles.helpers({
	roleShort: function() { return 'roles.'+this+'.short'; },

	maySubscribe: function() {
		return maySubscribe(Meteor.userId(), this.course, this.member.user, 'team');
	}
});

Template.member_roles.events({
	'click button.makeTeam': function(e, template) {
		Meteor.call("add_role", this.course._id, this.member.user, 'team', false);
		return false;
	}
});

Template.member_roles.helpers({
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
