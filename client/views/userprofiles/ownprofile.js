Router.map(function () {
	this.route('profile', {
		waitOn: function () {
			return Meteor.subscribe('users');
		},
		data: function () {
			var user = Meteor.user()
			if(user) {
				var userdata = user
				if(user.emails) {
					userdata.email = user.emails[0].address
					if(user.emails[0].verified){
						userdata.verifiedEmail = 'verified'
						userdata.veryfiedEmailTrue = '1'
					}
					else userdata.verifiedEmail = 'not verified'
				}
				return userdata
			}
		}
	})
})


Template.profile.userdata = function () {


  }


 Template.profile.isEditing = function () {
    return Session.get("isEditing");
  };

 Template.profile.events({
    'click input.edit': function () {
      // gehe in den edit-mode, siehe html
    Session.set("isEditing", true);
    },
    'click input.save': function () {
      // wenn im edit-mode abgespeichert wird, update db und verlasse den edit-mode
     //alert(document.getElementById('editform_username').value);

         Meteor.call('update_userdata', document.getElementById('editform_username').value,document.getElementById('editform_email').value); //kann nur auf server ausgeführt werden (file:Server.js)
         if(document.getElementById('editform_newpassword').value!=""){
         Meteor.call('update_userpassword', document.getElementById('editform_newpassword').value);
         }
         Session.set("isEditing", false);
    }
  });
  Template.profile.events({
    'click input.verify': function () {
      Meteor.call('sendVerificationEmail')
    }
  })
