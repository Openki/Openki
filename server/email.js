Meteor.methods({
	sendVerificationEmail: function(){Accounts.sendVerificationEmail(this.userId)}
//	sendVerificationEmail: Accounts.sendVerificationEmail
})


Meteor.methods({
	sendEmail: function (userId, text, revealAddress, sendCopy) {
		check([userId, text], [String]);

		var lg = 'en'; // Need to implement storing user's language

		var mail = {
			sender: 'openki@mail.openki.net'
		}

		var recipient = Meteor.users.findOne({
			_id: userId
		});

		if (recipient && recipient.emails && recipient.emails[0] && recipient.emails[0].address){
			mail.to = recipient.emails[0].address;
		} else {
			throw new Meteor.Error(401, "this user has no email")
		}

		var sender = Meteor.user();
		var senderAddress = false;
		if (sender.emails && sender.emails[0] && sender.emails[0].address){
			senderAddress = sender.emails[0].address;
		}

		if (senderAddress && revealAddress) {
			mail.from = senderAddress;
		} else {
			mail.from = mail.sender;
		}

		var names = {
			SENDER: sender.username,
			RECIPIENT: recipient.username,
			ADMINS: 'admins@openki.net'
		};

		mail.subject = '[Openki] ' + mf('sendEmail.subject', names, 'Message from {SENDER}', lg);

		mail.text = mf('sendEmail.greeting', names, 'Message from {SENDER} to {RECIPIENT}:', lg) + '\n'
		          + '--------------------------------------------------------------------\n'
				  + text.substr(0, 10000) + '\n'
				  + '--------------------------------------------------------------------\n'
				  + mf('sendEmail.footer', names, 'End of message.\nIf these messages are bothering you please let us know immediately {ADMINS}', lg);

		// Let other method calls from the same client start running,
		// without waiting for the email sending to complete.
		this.unblock();

		Email.send(mail);

		if (sendCopy && senderAddress) {
			mail.from = mail.sender;
			mail.to = senderAddress;
			Email.send(mail);
		}
	},
	
	report: function(subject, location, report) {
		var reporter = "A fellow visitor";
		if (this.userId) {
			var user = Meteor.users.findOne(this.userId);
			if (user) {
				reporter = user.username+" (UserID: "+this.userId+")"
			}
		}

		Email.send({
			from: 'reporter@mail.openki.net',
			to: 'admins@openki.net',
			subject: "Report: "+subject,
			text: "User "+reporter+" reports a problem on the page\n\n"+location+"\n\nTheir report:\n\n"+report+"\n\n/end of report"
		});
	}
});
