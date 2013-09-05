Meteor.methods({
  sendVerificationEmail: function(){Accounts.sendVerificationEmail(this.userId)}
//  sendVerificationEmail: Accounts.sendVerificationEmail
})






sendEmail = function(to, subject, text, html){

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

 // Email.send(email)
};
