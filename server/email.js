Meteor.methods({
  sendVerificationEmail: function(){Accounts.sendVerificationEmail(this.userId)}
//  sendVerificationEmail: Accounts.sendVerificationEmail
})


Meteor.methods({
  sendEmail: function (rec_user_id, from, subject, text) {

    var from = 'hmmm@schuel.ch'
    var subject = '[hmmm] '+subject

    var to= Meteor.users.findOne({_id:rec_user_id});
    if(to){
      if(to.emails[0].address){
        var to= to.emails[0].address;
      }
// für den fall, dass keine email vorhanden oder verifiziert ist, brauchts noch eine fehlermeldung
      else if(to.username){
        var to= to.username;
      }
      else{
        var to= "userid: "+user._id;
      }
    }

    check([to, from, subject, text], [String]);

    // Let other method calls from the same client start running,
    // without waiting for the email sending to complete.
    this.unblock();

var email = {
      from: from,
      to: to,
      subject: subject,
      text: text,
//      html: html
    }

    console.log('sending mail… ...................................................................')
    console.log(email)
    Email.send(email);
  }
});
