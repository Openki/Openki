Meteor.methods({
  sendVerificationEmail: function(){Accounts.sendVerificationEmail(this.userId)}
//  sendVerificationEmail: Accounts.sendVerificationEmail
})


Meteor.methods({
  sendEmail: function (rec_user_id, from, subject, text) {

    var from = 'hmmm@schuel.ch'
//    var siteName = getSetting('title')
//    var subject = '['+siteName+'] '+subject
    var subject = '[hmmm] '+subject



      var to= Meteor.users.findOne({_id:rec_user_id});

      if(to){
        if(to.emails[0].address){
          var to= to.emails[0].address;
        }
        else if(to.username){
          var to= to.username;
        }
        else{
          var to= "userid: "+user._id; // solange .username noch nix ist, haben wir nur die _id...
        }
        console.log(to)
      }

    check([to, from, subject, text], [String]);

    // Let other method calls from the same client start running,
    // without waiting for the email sending to complete.
    this.unblock();

    Email.send({
      to: to,
      from: from,
      subject: subject,
      text: text
    });
  }
});

/*
Meteor.methods({
  sendEmail: function(to, subject, text, html){
    check([to, from, subject, text], [String]);

    var from = 'hmmm@schuel.ch'
    var siteName = getSetting('title')
    var subject = '['+siteName+'] '+subject

    var email = {
      from: from,
      to: to,
      subject: subject,
      text: text,
      html: html
    }

    console.log('sending mail…')
    console.log(email)

    Email.send(email)
  }
};
*/
