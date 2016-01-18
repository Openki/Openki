
if (Meteor.settings.siteEmail) {
	Accounts.emailTemplates.from = Meteor.settings.siteEmail;
}

if (Meteor.settings.public && Meteor.settings.public.siteName) {
	Accounts.emailTemplates.siteName = Meteor.settings.public.siteName;
}


Meteor.methods({
	sendVerificationEmail: function() {
		Accounts.sendVerificationEmail(this.userId);
	},


	sendEmail: function (userId, text, revealAddress, sendCopy) {
		check([userId, text], [String]);

		var mail = {
			sender: Accounts.emailTemplates.from
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
		if (sender.emails && sender.emails[0] && sender.emails[0].address && sender.emails[0].verified) {
			senderAddress = sender.emails[0].address;
		}
		var contactString = '';
		mail.from = mail.sender;
		if (revealAddress) {
			if (senderAddress) {
				mail.from = senderAddress;
				contactString = mf('mail.contact.address', {SENDERMAIL:senderAddress}, 'Their mail address is {SENDERMAIL}', lg);
			} else {
				throw new Meteor.Error(400, "no verified email address");
			}
		}

		var names = {
			SENDER: htmlize(sender.username),
			RECIPIENT: recipient.username,
			ADMINS: 'admins.openki.net'
		};

		mail.subject = '['+Accounts.emailTemplates.siteName+'] ' + mf('sendEmail.subject', names, 'You got a Message from {SENDER}', lg);

		mail.html =
			mf('sendEmail.greeting', names, 'Message from {SENDER} to {RECIPIENT}:', lg)+ '<br>'
			+ '--------------------------------------------------------------------<br>'
			+ htmlize(text.substr(0, 10000)) + '<br>'
			+ '--------------------------------------------------------------------<br>'
			+ mf('sendEmail.endMessage', 'End of message.', lg)
			+ contactString +'<br><br>'
			+ mf('sendEmail.footer', names, 'If these messages are bothering you please let us know immediately {ADMINS}', lg);


		// Let other method calls from the same client start running,
		// without waiting for the email sending to complete.
		this.unblock();
		Email.send(mail);

		if (sendCopy && senderAddress) {
			mail.from = mail.sender;
			mail.to = senderAddress;
			mail.subject = '[Openki] ' + mf('sendEmail.copy.subject', names, 'Copy of your message to {RECIPIENT}', lg);
			Email.send(mail);
		}
	},

	report: function(subject, location, report) {
		var reporter = "A fellow visitor";
		var rootUrl = Meteor.absoluteUrl();
		if (this.userId) {
			var user = Meteor.users.findOne(this.userId);
			if (user) {
				reporter = "<a href='"+rootUrl+'user/'+this.userId+"'>"+htmlize(user.username)+"</a>";
			}
		}
		moment.locale('en');
		var version = Version.findOne();
		if (version) {
			var fullVersion = version.basic+(version.branch !== 'master' ? " "+version.branch : '');
			var commit = version.commitShort;
			var deployDate = moment(version.activation).format('lll');
			var restart = moment(version.lastStart).format('lll');
		}
		var timeNow = new Date();

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
				+"<br><br>The running version is ["+Accounts.emailTemplates.siteName+"] " +fullVersion+"  @ commit " +commit
				+"<br>It was deployed on "+deployDate+","
				+"<br>and last restarted on " +restart+"."
				+"<br>Now it's "+timeNow+"."
				+"<br>See you! bye."
				+"<br><br>/end of report."
		});
	}
});
