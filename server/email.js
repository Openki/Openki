import "/imports/notification/Notification.js";
import "/imports/HtmlTools.js";

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


	sendEmail: function (userId, message, revealAddress, sendCopy) {
		check(userId       , String);
		check(message      , String);
		check(revealAddress, Boolean);
		check(sendCopy     , Boolean);

		var recipient = Meteor.users.findOne(userId);
		if (!recipient) {
			throw new Meteor.error(404, "no such user");
		}
		if (!recipient.acceptsMessages){
			throw new Meteor.Error(401, "this user does not accept messages");
		}

		Notification.PrivateMessage.record
			( Meteor.userId()
			, recipient._id
			, message
			, revealAddress
			, sendCopy
			);
	},

	report: function(subject, location, userAgent, report) {
		var reporter = "A fellow visitor";
		var rootUrl = Meteor.absoluteUrl();
		if (this.userId) {
			var user = Meteor.users.findOne(this.userId);
			if (user) {
				reporter = "<a href='"+rootUrl+'user/'+this.userId+"'>"+HtmlTools.plainToHtml(user.username)+"</a>";
			}
		}
		moment.locale('en');
		var version = Version.findOne();
		var versionString = '';
		if (version) {
			var fullVersion = version.basic+(version.branch !== 'master' ? " "+version.branch : '');
			var commit = version.commitShort;
			var deployDate = moment(version.activation).format('lll');
			var restart = moment(version.lastStart).format('lll');
			versionString =
				"<br>The running version is ["+Accounts.emailTemplates.siteName+"] " +fullVersion+"  @ commit " +commit
				+"<br>It was deployed on "+deployDate+","
				+"<br>and last restarted on " +restart+".";
		}

		SSR.compileTemplate('messageReport', Assets.getText('messages/report.html'));

		Email.send({
			from: 'reporter@mail.openki.net',
			to: 'admins@openki.net',
			subject: "Report: " + subject,
			html: SSR.render("messageReport", {
				reporter: reporter,
				location: location,
				subject: subject,
				report: report,
				versionString: versionString,
				timeNow: new Date(),
				userAgent: userAgent
			})
		});
	}

});
