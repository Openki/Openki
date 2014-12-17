Router.map(function () {
	this.route('profile', {
		path: 'profile',
		waitOn: function () {
			return [ 
				Meteor.subscribe('currentUser'),
				Meteor.subscribe('coursesFind', 'all', false, { userInvolved: Meteor.userId() }),
				Meteor.subscribe('groups')
			];
		},
		data: function () {
			var user = Meteor.user()
			if(user) {
				var userdata = {
					_id: user._id,
					name: user.username,
					privacy: user.privacy,
					groups: !!user.groups && Groups.find({_id: {$in: user.groups}}).map(function(grp) { return grp.name }).join(', '),
					groupcount: user.groups && user.groups.length || 0
				}
				userdata.have_email = user.emails && user.emails.length > 0;
				if (userdata.have_email) {
					userdata.email = user.emails[0].address
					if(user.emails[0].verified){
						userdata.verifiedEmail = 'verified'
						userdata.veryfiedEmailTrue = '1'
					}
					else userdata.verifiedEmail = 'not verified'
				}
				
				return { 
					user: userdata,
					courses: coursesFind('all', false, { userInvolved: user._id })
				};
			}
		},
		onAfterAction: function() {
			var user = Meteor.users.findOne()
			if (!user) return;
			document.title = webpagename + 'My Profile_Settings - ' + user.username;
		}
	})
})


Template.profile.helpers({
	isEditing: function () {
		return Session.get("isEditing");
	},
	verifyDelete: function () {
		return Session.get('verify') === 'delete';
	}
});

Template.profile.events({
	'click input.edit': function () {
		Session.set("isEditing", true);
		// document.getElementById('privacy').checked = Meteor.user().privacy;  // FIXME!
		// var privacy = $(template.find('.privacy')).prop('checked');

	},
	'click button.delete': function () {
		Session.set('verify', 'delete');
	},
	'click button.confirmdelete': function () {
		Meteor.call('delete_profile', function() { 
			addMessage(mf('profile.deleted', 'Your account has been deleted'));
		});
		Session.set('verify', false);
	},
	'click .verifycancel': function () {
		Session.set('verify', false);
	},
	'click input.save': function () {
		// if it gets saved in edit-mode: update the db and leave edit-mode
		Meteor.call('update_userdata', document.getElementById('editform_username').value,document.getElementById('editform_email').value,document.getElementById('privacy').checked); //can only be run on serverside (file:server/main.js)
		if(document.getElementById('editform_newpassword').value!="") {
			Meteor.call('update_userpassword', document.getElementById('editform_newpassword').value);
		}
		Session.set("isEditing", false);
	},
	'click input.verify': function () {
		Meteor.call('sendVerificationEmail')
	}
});
