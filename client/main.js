
/* ------------------------- Startseite -------------------*/
//alert ("wilkommen auf der neuen fancy Schuel.ch Homepage");

// allgemeine praktische funktionen


 
Template.maincontent.route_is = function (data,options) {
// strube funktion, die irgendwas macht, aber es tut
// macht, dass das routing im template "maincontent" funtkioniert
  if ( Session.equals( 'page_id', data ) ) {
			return options.fn( this );
		}
		return options.inverse( this );
    };

Template.login.events({
    'submit #form_login':function (){
        //alert("mail: "+$("#email").val()+" passwd: "+$("#password").val());
        Meteor.loginWithPassword($("#email").val(), $("#password").val(), function(error){
            if(error){
                alert(error);
            }
            
        });
        return false;
    }
});
Template.register.events({
    'submit #form_register':function (){
        //alert("mail: "+$("#register_email").val()+" passwd: "+$("#register_password").val());
        Accounts.createUser({username:$("#register_username").val(),email:$("#register_email").val(), password:$("#register_password").val()} , function(error){
            if(error){
                alert(error);
            }
        });
        return false;
    }
});