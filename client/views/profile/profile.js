 Template.profile.userdata = function () {
  	if(Meteor.user()){
  		return {id:Meteor.userId(),username:Meteor.user().username,email:Meteor.user().emails[0].address};
  	}

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
   

 Template.profile.courses = function () {  
      return get_courselist({courses_from_userid: Meteor.userId()});
  };
