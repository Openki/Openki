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
				'inviteGroups': GroupLib.find({ own: true }),
				'showPrivileges': showPrivileges
			};
		},
		onAfterAction: function() {
			var user = Meteor.users.findOne({_id: this.params._id});
			if (!user) return; // wtf
			document.title = webpagename + '' + user.username + "'s Profile";
		}
	});
});


Template.userprofile.helpers({
	// whether userprofile is for the logged-in user
	ownuser: function () {
		return this.user && this.user._id === Meteor.userId();
	},

	groupMember: function(group, user) {
		return user && group && group.members && group.members.indexOf(user._id) >= 0;
	},

	showInviteGroups: function() {
		return this.inviteGroups.count && this.inviteGroups.count() > 0;
	},

	showSettings: function() {
		var showPrivileges = Template.instance().data.showPrivileges;
		var showInviteGroups = this.inviteGroups.count && this.inviteGroups.count() > 0;
		return showPrivileges || showInviteGroups;
	},
	roles: function() {
		return _.clone(Roles).reverse();
	},
	coursesByRole: function(role) {
		var templateData = Template.instance().data;
		var involvedIn = templateData.involvedIn;
		var userID = templateData.user._id;
		var coursesForRole = [];

		involvedIn.forEach(function(course) {			
			if(!!hasRoleUser(course.members, role, userID)) {
				coursesForRole.push(course);
			}
		});
		return coursesForRole;
	},
	roleUserList: function() {
		return 'roles.'+this.type+'.userList';
	},
	getName: function() {
		return Template.instance().data.user.username;
	}
});


Template.userprofile.events({
	'click button.giveAdmin': function() {
		Meteor.call('addPrivilege', this.user._id, 'admin', function(err) {
			if (err) {
				showServerError('Unable to add privilege', err);
			} else {
				addMessage(mf('privilege.addedAdmin', 'Granted admin privilege'), 'success');
			}
		});
	},

	'click button.giveUpload': function() {
		Meteor.call('addPrivilege', this.user._id, 'upload', function(err) {
			if (err) {
				showServerError('Unable to add privilege', err);
			} else {
				addMessage(mf('privilege.addedUpload', 'Granted upload privilege'), 'success');
			}
		});
	},

	'click .js-remove-privilege-btn': function(event, template) {
		var priv = template.$(event.target).data('priv');
		Meteor.call('removePrivilege', this.user._id, priv, function(err) {
			if (err) {
				showServerError('Unable to remove privilege', err);
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
				showServerError('Unable to draft user into group', err);
			} else {
				addMessage(mf('profile.group.drafted', { NAME: name }, 'Added to group {NAME}'), 'success');
			}
		});
	},

	'click .js-group-expel-btn': function(event, template) {
		Tooltips.hide();
		var groupId = this._id;
		var name = this.name;
		var userId = Template.parentData().user._id;
		Meteor.call('updateGroupMembership', userId, groupId, false, function(err) {
			if (err) {
				showServerError('Unable to expel user from group', err);
			} else {
				addMessage(mf('profile.group.expelled', { NAME: name }, 'Expelled from group {NAME}'), 'success');
			}
		});
	},
});

Template.emailBox.events({
	'change .js-send-own-adress': function (event, instance) {
		instance.$('.js-send-own-adress + .checkmark').toggle();
	},

	'change .js-receive-copy': function (event, instance) {
		instance.$('.js-receive-copy + .checkmark').toggle();
	},

	'submit form.sendMail': function (event, template) {
		event.preventDefault();
		if (pleaseLogin()) return;

		var rec_user_id = this.user._id;
		var rec_user = Meteor.users.findOne({_id:rec_user_id});
		if(rec_user){
			if(rec_user.username){
				rec_user = rec_user.username;
			}
		}

		var message = template.$('#emailmessage').val();
		var revealAddress = template.$('#sendOwnAdress').is(':checked');
		var receiveCopy = template.$('#receiveCopy').is(':checked');

		if (message.length < '2') {
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
