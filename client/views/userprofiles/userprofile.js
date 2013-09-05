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



/*
    var user = selected_user
  	if(user) {
  		var userdata = {id:Meteor.userId(),username:Meteor.user().username}
  	}
}
*/

Template.userprofile.events({
'click input.sendmail': function () {
  Meteor.call('sendEmail', '1', '2', '3',
// 			'this.user.emails[0].address',
//            'selected_user_ID.emails[0].adress',
//            'Ping - Hello from Meteor!',
            'emailmessage');
}
})





/*  global setzen für klicks auf usernamen

   Template.YXZYXZYX.events({
    'click': function () {
      Router.setUser( this._id, this.name);
    }
  });

*/