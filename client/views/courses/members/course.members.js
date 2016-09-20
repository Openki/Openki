Template.courseMembers.helpers({
	howManyEnrolled: function() {
		return this.members.length;
	}
});

Template.courseMember.helpers({
	showMemberRoles: function() {
		var memberRoles = this.member.roles;
		if (memberRoles.length == 1) {
			return memberRoles[0] != "participant" ? true : false;
		} else {
			return true;
		}
	},
	
	roleShort: function() { return 'roles.'+this+'.short'; },

	maySubscribe: function() {
		return maySubscribe(Meteor.userId(), this.course, this.member.user, 'team');
	},

	rolelistIcon: function(roletype) {
		if (roletype != "participant") {
			return _.findWhere(Roles, { type: roletype }).icon;
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
						showServerError('Unable to change your message', err);
					} else {
						addMessage(mf('subscribemessage.saving.success', { NAME: course.name }, 'Changed your message on {NAME}'), 'success');
					}
				});
			},
			mf('roles.message.placeholder', 'My interests...')
		);
	}
});

Template.courseMember.events({
	'click .js-add-to-team-btn': function(e, template) {
		Meteor.call("add_role", this.course._id, this.member.user, 'team', false);
		return false;
	}
});
