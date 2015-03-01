Meteor.methods({
	sendVerificationEmail: function(){Accounts.sendVerificationEmail(this.userId)}
//	sendVerificationEmail: Accounts.sendVerificationEmail
})


Meteor.methods({
	sendEmail: function (rec_user_id, from, subject, text) {

		var from = 'kontakt@openki.net';
		var subject = '[Openki] '+subject;

		var to = Meteor.users.findOne({_id:rec_user_id});
		if(to && to.emails && to.emails[0] && to.emails[0].address){
			var to= to.emails[0].address;
		}
		else {
			throw new Meteor.Error(401, "this user has no email")
		}
		check([to, from, subject, text], [String]);

		// Let other method calls from the same client start running,
		// without waiting for the email sending to complete.
		this.unblock();

var email = {
			from: from,
			to: to,
			subject: subject,
			text: text+'\nhttp://openki.net'
//			html: html
		}

		console.log('sending mail… ...................................................................')
		console.log(email)
		Email.send(email);
	},
	
	report: function(subject, location, report) {
		var reporter = "A fellow visitor";
		if (this.userId) {
			var user = Meteor.users.findOne(this.userId);
			if (user) {
				reporter = user.username+" ("+this.userId+")"
			}
		}

		Email.send({
			from: 'reporter@openki.net',
			to: 'admins@openki.net',
			subject: "Report: "+subject,
			text: reporter+" reports a problem on the page\n\n"+location+"\n\nTheir report:\n"+report+"\n/end of report"
		});
	}
});
