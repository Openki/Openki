Template.courseMembers.helpers({
	howManyEnrolled: function() {
		return this.members.length;
	}
});


Template.courseMember.onCreated(function() {
	var instance = this;
	var courseId = this.data.course._id;

	instance.editableMessage = Editable(
		true,
		function(newMessage) {
			Meteor.call("change_comment", courseId, newMessage, function(err, courseId) {
				if (err) {
					showServerError('Unable to change your message', err);
				} else {
					addMessage("\u2713 " + mf('_message.saved'), 'success');
				}
			});
		},
		mf('roles.message.placeholder', 'My interests...')
	);

	instance.autorun(function() {
		var data = Template.currentData();
		instance.editableMessage.setText(data.member.comment);
	});
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
		var mayChangeComment = this.member.user === Meteor.userId();
		return mayChangeComment && Template.instance().editableMessage;
	},

	mayUnsubscribeFromTeam: function(label) {
		return label == 'team'
			&& mayUnsubscribe(Meteor.userId(), this.course, this.member.user, 'team');
	},
});

Template.courseMember.events({
	'click .js-add-to-team-btn': function(e, template) {
		Meteor.call("add_role", this.course._id, this.member.user, 'team', false);
		return false;
	},
	'click .js-remove-from-team-btn': function(e, template) {
		if(this.member.user === Meteor.userId() && !privileged(Meteor.userId(), 'admin')){
			if (confirm(mf("course.detail.remove.yourself.team", "Remove yourself from the team? Only another member can add you again."))) {
				Meteor.call("remove_role", this.course._id, this.member.user, 'team');
			}
		} else {
			if (confirm(mf("course.detail.remove.other.team", "Do you really want to remove this member from the team?"))) {
				Meteor.call("remove_role", this.course._id, this.member.user, 'team');
			}
		}
		return false;
	}
});
