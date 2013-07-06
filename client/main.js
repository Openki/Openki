
/* ------------------------- Startseite -------------------*/
//alert ("wilkommen auf der neuen fancy Schuel.ch Homepage");

// allgemeine praktische funktionen

Session.set("showRegisterDialog", false);
Session.set("showLoginDialog", true);
 
Template.maincontent.route_is = function (data,options) {
// strube funktion, die irgendwas macht, aber es tut
// macht, dass das routing im template "maincontent" funtkioniert
    if ( Session.equals( 'page_id', data ) ) {
	return options.fn( this );
    }
    return options.inverse( this );
};

Template.login_info.userdata = function(){
    if (Meteor.user()){
        return Meteor.user().username;
    }
};

Template.login_info.events({
    'submit #form_login':function (){
        //alert("mail: "+$("#email").val()+" passwd: "+$("#password").val());
        Meteor.loginWithPassword($("#email").val(), $("#password").val(), function(error){
            if(error){
                alert(error);
            }
            
        });
        return false;
    },
    'submit #form_register':function (){
        alert("mail: "+$("#register_email").val()+" passwd: "+$("#register_password").val());
        //var email = trimInput($("#register_email").val());

            Accounts.createUser({username:$("#register_username").val(),email:$("#register_email").val(), password:$("#register_password").val()} , function(error){
                if(error){
                    alert(error);
                }
            });
        return false;
    },
    'click input.show_register': function(){
        Session.set("showRegisterDialog", true);
        Session.set("showLoginDialog", false);
    },
    'click input.show_login': function(){
        Session.set("showRegisterDialog", false);
        Session.set("showLoginDialog", true);
    },
    'click input.logout': function(){
        Session.set("showRegisterDialog", false);
        Session.set("showLoginDialog", true);
        Meteor.logout(function(error){
            if(error){
                alert(error);
            }
        });

    },
});

Template.login_info.register = function () {
    return Session.get("showRegisterDialog");
};
Template.login_info.login = function () {
    return Session.get("showLoginDialog");
};    

