Template.courseMembers.onCreated(function() {
	this.increaseBy = 10;
	this.membersLimit = new ReactiveVar(this.increaseBy);
});

Template.courseMembers.helpers({
	howManyEnrolled: function() {
		return this.members.length;
	},

	sortedMembers: function() {
    	var sortedMembers = this.members.sort(function(a, b) {
	        var aRoles = _.without(a.roles, 'participant');
	        var bRoles = _.without(b.roles, 'participant');

	        return aRoles.length < bRoles.length;
        });

		var membersLimit = Template.instance().membersLimit.get();
		if (membersLimit) {
			sortedMembers = sortedMembers.slice(0, membersLimit);
		}

		return sortedMembers;
	},

	limited: function() {
		var membersLimit = Template.instance().membersLimit.get();
		return membersLimit && this.members.length >= membersLimit;
	},

	increaseBy: function() {
		return Template.instance().increaseBy;
	}
});

Template.courseMembers.events({
	'click .js-show-all-members': function(e, instance) {
		var membersLimit = instance.membersLimit;

		membersLimit.set(membersLimit.get() + instance.increaseBy);
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
		return memberRoles.length != 1 || memberRoles[0] != "participant";
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
	}
});

Template.removeFromTeamDropdown.helpers({
	isNotPriviledgedSelf: function() {
		var notPriviledgedUser = !privileged(Meteor.userId(), 'admin');
		return (this.member.user === Meteor.userId() && notPriviledgedUser);
	}
});

Template.courseMember.events({
	'click .js-add-to-team-btn': function(e, template) {
		Meteor.call("add_role", this.course._id, this.member.user, 'team', false);
		return false;
	},
	'click .js-remove-team': function(e, template) {
		Meteor.call("remove_role", this.course._id, this.member.user, 'team');
		return false;
	}
});
