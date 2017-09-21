/* global Notification: true */
export default Notification = {};
import '/imports/collections/Log.js';

import notificationEvent   from '/imports/notification/Notification.Event.js';
import notificationComment from '/imports/notification/Notification.Comment.js';
import notificationJoin    from '/imports/notification/Notification.Join.js';
import notificationPrivateMessage from '/imports/notification/Notification.PrivateMessage.js';

Notification.Event   = notificationEvent;
Notification.Comment = notificationComment;
Notification.Join    = notificationJoin;
Notification.PrivateMessage = notificationPrivateMessage;

/** Handle event notification
  *
  * @param entry Notification.Event log entry to process
  */
Notification.send = function(entry) {
	// Find out for which recipients sending has already been attempted.
	var concluded = {};

	Log.find(
		{ tr: 'Notification.SendResult'
		, rel: entry._id
		}
	).forEach(function(result) {
		concluded[result.body.recipient] = true;
	});

	var model = Notification[entry.body.model].Model(entry);

	_.each(entry.body.recipients, (recipientId) => {
		if (!concluded[recipientId]) {
			var mail = null;
			var unsubToken = null;
			var userId = null;

			try {
				var user = Meteor.users.findOne(recipientId);
				userId = user._id;

				if (user.notifications === false) {
					throw "User wishes to not receive notifications";
				}

				if (!user.emails || !user.emails[0] || !user.emails[0].address) {
					throw "Recipient has no email address registered";
				}

				var	email = user.emails[0];
				var address = email.address;

				var username = user.username;
				var userLocale = user.profile && user.profile.locale || 'en';

				var siteName = Accounts.emailTemplates.siteName;
				var subjectPrefix = '['+siteName+'] ';

				unsubToken = Random.secret();

				var vars = model.vars(userLocale, user);

				const fromAddress = vars.fromAddress
				                 || Accounts.emailTemplates.from;

				vars.unsubLink = Router.url('profile.unsubscribe', { token: unsubToken });
				vars.siteName = siteName;
				vars.locale = userLocale;
				vars.username = username;

				var message = SSR.render(model.template, vars);

				// Template can't handle DOCTYPE header, so we add the thing here.
				var DOCTYPE = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">';
				message = DOCTYPE + message;

				mail =
					{ from: fromAddress
					, sender: Accounts.emailTemplates.from
					, to: address
					, subject: subjectPrefix + vars.subject
					, html: message
					};

				Email.send(mail);

				Notification.SendResult.record(entry, unsubToken, true, recipientId, mail, "success");
			}
			catch(e) {
				var reason = e;
				if (typeof e == 'object' && 'toJSON' in e) reason = e.toJSON();
				Notification.SendResult.record(entry, unsubToken, false, recipientId, mail, reason);
			}
		}
	});
};


Notification.SendResult = {};

/** Record the result of a notification delivery attempt
  * @param  {object} note      - notification log-entry
  * @param      {ID} unsubToken - token that can be used to unsubscribe from
  *                               further notices
  * @param {Boolean} sent      - whether the notification was sent
  * @param      {ID} recipient - recipient user ID
  * @param  {String} message   - generated message (or null if we didn't get
  *                              that far)
  * @param  {String} reason    - why this log entry was recorded
  */
Notification.SendResult.record = function(note, unsubToken, sent, recipient, message, reason) {
	check(sent, Boolean);
	check(unsubToken, Match.Maybe(String));
	check(recipient, String);
	check(message, Match.Maybe(Object));
	var entry = {
		sent: sent,
		recipient: recipient,
		message: message,
		reason: reason,
		unsubToken: unsubToken
	};

	var rel = [ note._id, recipient ];
	if (unsubToken) rel.push(unsubToken);

	Log.record('Notification.SendResult', rel, entry);
};
