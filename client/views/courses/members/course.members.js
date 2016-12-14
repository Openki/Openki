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

	theFasterTakesTheCrown: function(label) {
		var course = this.course;
		var isSubscribedAsTeam = hasRoleUser(course.members, 'team', Meteor.userId() ) == 'subscribed';
		var hasEditableRights = course.editableBy(Meteor.userId());
		// allow admins or team members to unsubscribe team members
		return label == 'team' && (hasEditableRights || isSubscribedAsTeam);
	},
});

Template.courseMember.events({
	'click .js-add-to-team-btn': function(e, template) {
		Meteor.call("add_role", this.course._id, this.member.user, 'team', false);
		return false;
	},
	'click .js-remove-from-team-btn': function(e, template) {
		Meteor.call("remove_role", this.course._id, this.member.user, 'team');
		return false;
	}
});
