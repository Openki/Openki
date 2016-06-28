Template.courseMember.helpers({
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

Template.courseMembers.helpers({
	howManyEnrolled: function() {
		return this.members.length;
	}
});


Template.courseMember.events({
	'click .js-add-to-team-btn': function(e, template) {
		Meteor.call("add_role", this.course._id, this.member.user, 'team', false);
		return false;
	},
	'mouseover .js-add-to-team-btn': function(e, template) {
		$('.add-to-team-btn-txt.' + this.member.user).show(0);
		$('.add-to-team-btn-plus.' + this.member.user).hide(0);
	},
	'mouseout .js-add-to-team-btn': function(e, template) {
		$('.add-to-team-btn-txt.' + this.member.user).hide(0);
		$('.add-to-team-btn-plus.' + this.member.user).show(0);
	}
});
