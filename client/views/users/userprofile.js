Router.map(function() {
	this.route('userprofile', {
		path: 'user/:_id/:username?',
		waitOn: function () {
			return [
				Meteor.subscribe('users'),
				Meteor.subscribe('coursesFind', 'all', false, { userInvolved: this.params._id })
			];
		},
		data: function () {
			return {
				'user': Meteor.users.findOne({_id: this.params._id}),
				'involvedIn': coursesFind('all', false, { userInvolved: this.params._id })
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
		return this._id === Meteor.userId()
	}
})


Template.userprofile.events({
	'click input.sendmail': function () {
		var send_user = Meteor.user()
		if(send_user) {
			var send_userdata = {id:Meteor.userId(),username:Meteor.user().username}
			if(send_user.emails) {
				send_userdata.email = send_user.emails[0].address
			}
			var rec_user_id = this._id
			var rec_user = Meteor.users.findOne({_id:rec_user_id});
			if(rec_user){
				if(rec_user.username){
					var rec_user = rec_user.username;
				}
			}
			var message = document.getElementById('emailmessage').value
			if (message.length >= '7'){
				Meteor.call('sendEmail',
				rec_user_id,
				'from',
				'privat-message from '+send_userdata.username,
				'hello '+rec_user+',	 '+send_userdata.username+' sends you the following message:	"'+message+'"   \n	cheers!	  his/hers direct contact is: '+send_userdata.email);
				alert ('email could have been sent')
				//todo: reset clear the form.
			}
			else {alert ('longer text please')}
		}
		else {alert ('login...')}
	}
})
