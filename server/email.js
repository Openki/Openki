Meteor.methods({
	sendVerificationEmail: function(){Accounts.sendVerificationEmail(this.userId)}
})


Meteor.methods({
	sendEmail: function (userId, text, revealAddress, sendCopy) {
		check([userId, text], [String]);

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

		var lg = (recipient.profile.locale || 'en');
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
			SENDER: htmlize(sender.username),
			RECIPIENT: recipient.username,
			ADMINS: 'admins.openki.net'
		};

		mail.subject = '[Openki] ' + mf('sendEmail.subject', names, 'You got a Message from {SENDER}', lg);

		mail.html =
			mf('sendEmail.greeting', names, 'Message from {SENDER} to {RECIPIENT}:', lg)+ '<br>'
			+ '--------------------------------------------------------------------<br>'
			+ htmlize(text.substr(0, 10000)) + '<br>'
			+ '--------------------------------------------------------------------<br>'
			+ mf('sendEmail.footer', names, 'End of message. <br> If these messages are bothering you please let us know immediately {ADMINS}', lg);


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
		var rootUrl = Meteor.absoluteUrl()
		var profileLink ="123"
		if (this.userId) {
			var user = Meteor.users.findOne(this.userId);
			if (user) {
				reporter = "<a href='"+rootUrl+'user/'+this.userId+"'>"+htmlize(user.username)+"</a>";
			}
		}

		Email.send({
			from: 'reporter@mail.openki.net',
			to: 'admins@openki.net',
			subject: "Report: " + subject,
			html: "User " + reporter +
				" reports a problem on the page <a href='"+htmlize(location)+"'>"+htmlize(subject)+"</a>"
				+"<br><br>"
				+"Their report:<br>"
				+"-------------------------------------------------------------------------------------"
				+"<br><br>"+htmlize(report)+"<br><br>"
				+"-------------------------------------------------------------------------------------"
				+"<br>/end of report."
		});
	}
});
