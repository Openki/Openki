Template.member_roles.helpers({
	roleShort: function() { return 'roles.'+this+'.short'; },

	maySubscribe: function() {
		return maySubscribe(Meteor.userId(), this.course, this.member.user, 'team');
	},

	rolelist_icon: function(roletype) {
		if (roletype != "participant") {
			return Roles.findOne({ type: roletype }).icon;
		}
	},

	hasRoles: function() {
		if (this.member.roles == "participant") {
			return false;
		}
		else {
			return true;
		}
	},

	editableMessage: function() {
		var course = this.course;
		if (this.member.user !== Meteor.userId()) return false;
		return makeEditable(
			this.member.comment,
			true,
			function(newMessage) {
				Meteor.call("change_comment", course._id, newMessage, function(err, courseId) {
					if (err) {
						addMessage(mf('subscribemessage.saving.error', { ERROR: err }, 'Unable to change your message. We encountered the following error: {ERROR}'), 'danger');
					} else {
						addMessage(mf('subscribemessage.saving.success', { NAME: course.name }, 'Changed your message on {NAME}'), 'success');
					}
				});
			},
			mf('roles.message.placeholder', 'Tell others about my interests')
		);
	}
});

Template.member_roles.events({
	'click button.makeTeam': function(e, template) {
		Meteor.call("add_role", this.course._id, this.member.user, 'team', false);
		return false;
	},
	'mouseover button.makeTeam': function(e, template) {
		$("." + this.member.user).show(0);
		$('.makeTeamPlus').hide(0);
	},
	'mouseout button.makeTeam': function(e, template) {
		$("." + this.member.user).hide(0);
		$('.makeTeamPlus').show(0);
	}
});
