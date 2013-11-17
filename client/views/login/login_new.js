Template.layout.rendered=function(){
	if(!Meteor.user()){
		$('.login-link-text').text("Sign Up/Sign In");
	}else{
		$('#login-buttons-logout').before('<a class="profile-link-button" href="/user/'+Meteor.user()._id+'">My Public Profile</a><br/>');
		$('#login-buttons-logout').before('<a class="profile-link-button" href="/profile">My Account</a>');
  }
};
