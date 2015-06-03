Template.memberRoles.helpers({
	roleShort: function() { return 'roles.'+this+'.short'; },

	maySubscribe: function() {
		return maySubscribe(Meteor.userId(), this.course, this.member.user, 'team');
	}
});

Template.memberRoles.events({
	'click button.makeTeam': function(e, template) {
		Meteor.call("add_role", this.course._id, this.member.user, 'team', false);
		return false;
	}
});


Template.roleDetail.created = function() {
	this.enrolling = new ReactiveVar(false);
};

Template.roleDetail.helpers({
	enrolling: function() { return Template.instance().enrolling.get() },

	roleSubscribe: function() {
		return 'roles.'+this.type+'.subscribe';
	},	
	
	roleSubscribed: function() {
		return 'roles.'+this.type+'.subscribed';
	},
	
	maySubscribe: function(role) {
		var operator = Meteor.userId();
		
		// Show the participation buttons even when not logged-in.
		// fun HACK: if we pass an arbitrary string instead of falsy
		// the maySubscribe() will return true if the user could subscribe
		// if they were logged-in. Plain abuse of maySubscribe().
		if (!operator) operator = 'unlogged';

		return maySubscribe(operator, this.course, operator, role);
	}
});

Template.roleDetail.events({
	'click button.enrol': function(e, template) {
		if (pleaseLogin()) return;
		template.enrolling.set(true);
		return false;
	},
	
	'click button.subscribe': function (e, template) {
		if (template.find('.incognito')) {
			var incognito = $(template.find('.incognito')).prop('checked');
		} else incognito = false
		Meteor.call("add_role", this.course._id, Meteor.userId(), this.roletype.type, incognito);
		
		// Store the comment
		var comment = $(template.find('.enrol_as_comment')).val();
		Meteor.call("change_comment", this.course._id, comment);
		template.enrolling.set(false);
		return false;
	},

	'click button.cancel': function (e, template) {
		template.enrolling.set(false);
		return false;
	},

	'click button.unsubscribe': function () {
		Meteor.call('remove_role', this.course._id, this.roletype.type);
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