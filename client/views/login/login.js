Session.set("showRegisterDialog", false);
Session.set("showLoginDialog", true);

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
        //alert("mail: "+$("#register_email").val()+" passwd: "+$("#register_password").val());
        //var email = trimInput($("#register_email").val());
            //Meteor.call('insert_userdata');
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

//use Meteorite-package 'Mesosphere' for Form-creation & validation -> https://atmosphere.meteor.com/package/Mesosphere
//Problem: function Accounts.createUser() doesn't work called from Meteor.methods.. why?

Mesosphere({
    name:"registerForm",
    method:"register",
    fields:{
        user:{
            required:true,
            message: "gimmesommore!",
            rules:{
                //maxLength:20,
                minLength:4
            }
            //transforms:["trim"]
        },
        email:{
            required:true,
            message: "gimmesommore!",
            rules:{
                //maxLength:20,
                minLength:4
            }
            //transforms:["trim"]
        },
        pwd:{
            required:true,
            message: "gimmesommore",
            rules:{
                minLength:6
            }
        }
    }
});

bliblablu = function(username, email, password){
    alert ("wtf!!!");
    Accounts.createUser({'username':"username", 'email':"email", 'password':"password"} , function(error){
        if(error){
            alert(error);
        }
    });
};

Meteor.methods({
    register:function(rawFormData){
        var validationObject = Mesosphere.registerForm.validate(rawFormData);
        //alert(validationObject.formData.user);
        //newUser = processUser(validationObject.formData);
        //alert (validationObject.formData);
        Accounts.createUser({'username':"username", 'email':"email", 'password':"password"} , function(error){
            if(error){
                alert(error);
            }
        });
        //alert (validationObject.errors);
        if(!validationObject.errors){
            //alert("username:"+validationObject.formData.user+",email:"+validationObject.formData.email+", password:"+validationObject.formData.pwd);
            bliblablu(validationObject.formData.user, validationObject.formData.email, validationObject.formData.pwd);
            // Accounts.createUser({'username':"username", 'email':"email", 'password':"password"} , function(error){
            //     if(error){
            //         alert(error);
            //     }
            // });
            // Meteor.call('insert_userdata', validationObject.formData.user, validationObject.formData.email, validationObject.formData.pwd);
        }
        else{
            alert("error: "+validationObject.errors);
        }
    }
});