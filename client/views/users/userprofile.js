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
		return this.user._id === Meteor.userId()
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
			var rec_user_id = this.user._id
			var rec_user = Meteor.users.findOne({_id:rec_user_id});
			if(rec_user){
				if(rec_user.username){
					var rec_user = rec_user.username;
				}
			}
			var messageInput = document.getElementById('emailmessage').value;
			if ($('#sendOwnAdress').is(':checked')){
				var ownMail = '\n  his/hers direct contact is: '+send_userdata.email
			};
			var receiveCopy = $('#receiveCopy').is(':checked');
			var message = 'hello '+rec_user+',\n'+send_userdata.username+' sends you the following message:\n"'+messageInput+'"'+(ownMail?ownMail:'')+'\n\ncheers!';

			if (messageInput.length >= '7'){
				Meteor.call('sendEmail',
				rec_user_id,
				'from',
				'Privat-message from '+send_userdata.username,
				message,
				function(error, result){
					if (error) addMessage(error)
				}
				);
				if (receiveCopy){
					Meteor.call('sendEmail',
					send_user._id,
					'from',
					'Copy of your Privat-message to '+rec_user,
					message);
				//todo: reset clear the form.
				addMessage(mf('email.sent', 'email could have been sent'));

				}

			}
			else {alert ('longer text please')}
		}
		else {alert ('login...')}
	}
})

/*
else if(to.username){
				var to= to.username;
			}
			else{
				var to= "userid: "+user._id;
			}
*/