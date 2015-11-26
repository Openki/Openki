Router.map(function() {
	this.route('userprofile', {
		path: 'user/:_id/:username?',
		waitOn: function () {
			return [
				Meteor.subscribe('user', this.params._id),
				Meteor.subscribe('groupsFind', { own: true }),
				Meteor.subscribe('coursesFind', { userInvolved: this.params._id })
			];
		},
		data: function () {
			var user = Meteor.users.findOne({_id: this.params._id});
			if (!user) return; // not loaded?

			// What privileges the user has
			var privileges = _.reduce(['admin', 'upload'], function(ps, p) {
				ps[p] = privileged(user, p);
				return ps;
			}, {});

			var alterPrivileges = privilegedTo('admin');
			var showPrivileges = alterPrivileges || (user.privileges && user.privileges.length);

			return {
				'user': user,
				'involvedIn': coursesFind({ userInvolved: this.params._id }),
				'alterPrivileges': alterPrivileges,
				'privileges': privileges,
				'inviteGroups': groupsFind({ own: true }),
				'showPrivileges': showPrivileges
			};
		},
		onAfterAction: function() {
			var user = Meteor.users.findOne({_id: this.params._id})
			if (!user) return; // wtf
			document.title = webpagename + '' + user.username + "'s Profile"
		}
	})
})


Template.userprofile.helpers({
	// whether userprofile is for the logged-in user
	ownuser: function () {
		return this.user && this.user._id === Meteor.userId()
	},
	
	groupMember: function(group, user) {
		return user && group && group.members && group.members.indexOf(user._id) >= 0;
	}
})


Template.userprofile.events({
	'click button.giveAdmin': function() {
		Meteor.call('addPrivilege', this.user._id, 'admin', function(err) {
			if (err) {
				addMessage(mf('privilege.errorAdding', { ERROR: err }, 'Unable to add privilege: {ERROR}'), 'danger');
			} else {
				addMessage(mf('privilege.addedAdmin', 'Granted admin privilege'), 'success');
			}
		});
	},
	
	'click button.giveUpload': function() {
		Meteor.call('addPrivilege', this.user._id, 'upload', function(err) {
			if (err) {
				addMessage(mf('privilege.errorAdding', { ERROR: err }, 'Unable to add privilege: {ERROR}'), 'danger');
			} else {
				addMessage(mf('privilege.addedUpload', 'Granted upload privilege'), 'success');
			}
		});
	},
	
	'click button.remove': function(event, template) {
		var priv = template.$(event.target).data('priv')
		Meteor.call('removePrivilege', this.user._id, priv, function(err) {
			if (err) {
				addMessage(mf('privilege.errorRemoving', { ERROR: err }, 'Unable to remove privilege: {ERROR}'), 'danger');
			} else {
				addMessage(mf('privilege.removed', 'Removed privilege'), 'success');
			}
		});
	},
	
	'click button.draftIntoGroup': function(event, template) {
		var groupId = this._id;
		var name = this.name;
		var userId = Template.parentData().user._id;
		Meteor.call('updateGroupMembership', userId, groupId, true, function(err) {
			if (err) {
				addMessage(mf('profile.group.draftError', { ERROR: err }, 'Unable draft user into group: {ERROR}'), 'danger');
			} else {
				addMessage(mf('profile.group.drafted', { NAME: name }, 'Added to group {NAME}'), 'success');
			}
		});
	},
	
	'click button.expelFromGroup': function(event, template) {
		var groupId = this._id;
		var name = this.name;
		var userId = Template.parentData().user._id;
		Meteor.call('updateGroupMembership', userId, groupId, false, function(err) {
			if (err) {
				addMessage(mf('profile.group.expelError', { ERROR: err }, 'Unable expel user from group: {ERROR}'), 'danger');
			} else {
				addMessage(mf('profile.group.expelled', { NAME: name }, 'Expelled from group {NAME}'), 'success');
			}
		});
	},
});

Template.emailBox.events({
	'submit form.sendMail': function (event, template) {
		event.preventDefault();
		if (pleaseLogin()) return;

		var send_user = Meteor.user();

		var rec_user_id = this.user._id
		var rec_user = Meteor.users.findOne({_id:rec_user_id});
		if(rec_user){
			if(rec_user.username){
				var rec_user = rec_user.username;
			}
		}

		var message = template.$('#emailmessage').val();
		var revealAddress = template.$('#sendOwnAdress').is(':checked');
		var receiveCopy = template.$('#receiveCopy').is(':checked');

		if (message.length < '8') {
			alert(mf('profile.mail.longertext', 'longer text please'));
			return;
		}

		Meteor.call(
			'sendEmail',
			this.user._id,
			message,
			revealAddress,
			receiveCopy,
			function(error, result) {
				if (error) {
					addMessage(error, 'danger');
				} else {
					addMessage(mf('profile.mail.sent', 'Your message was sent'), 'success');
					template.$('#emailmessage').val('');
				}
			}
		);
	}
});

Template.userprofile.rendered = function() {
	var currentPath = Router.current().route.path(this)
	$('a[href!="' + currentPath + '"].nav_link').removeClass('active');
	$('a.loginButton.nav_link').addClass('active');
}
