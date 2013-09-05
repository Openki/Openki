Template.userprofile.user_existent = function () {
	if (Meteor.users.findOne({_id:(Session.get('selected_user'))})){
		return("user_existent", true);
	}
	else {
		return("user_existent", false);
	}
};

Template.userprofile.selected_user_ID = function () {
	return Session.get('selected_user');
}



Template.userprofile.events({
'click input.sendmail': function () {
//	var rec_user = Session.get('selected_user')
	var send_user = Meteor.user()
	if(send_user) {
			var send_userdata = {id:Meteor.userId(),username:Meteor.user().username}
			if(send_user.emails) {
				send_userdata.email = send_user.emails[0].address
			}
		var rec_user = Session.get('selected_user')

/*
		if(rec_user) {
			var rec_userdata = {id:rec_user.userId(),username:rec_user().username}
			if(rec_user.emails) {
				rec_userdata.email = rec_user.emails[0].address
			}
		}
		*/

	//	var message = emailmessage
		var message = document.getElementById('emailmessage').value
		Meteor.call('sendEmail',
		rec_user,
		'from',
		'privat-message from '+send_userdata.username,
		'hello '+rec_user+',     '+send_userdata.username+' sends you the following message:    "'+message+'"       cheers!      his/hers direct contact is: '+send_userdata.email
		);
		alert ('email maybe sent')
		}
		else {alert ('login...')}
	}
})





/*  global setzen für klicks auf usernamen

   Template.YXZYXZYX.events({
    'click': function () {
      Router.setUser( this._id, this.name);
    }
  });

*/