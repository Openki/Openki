export default notificationPrivateMessage = {};
import '/imports/collections/Log.js';
import '/imports/StringTools.js';
import "/imports/HtmlTools.js";

/** Record the intent to send a private message
  *
  * @param      {ID} senderId - id of the user that sends the message
  * @param      {ID} recipientId - id of the intended recipient
  * @param  {String} message - the message to transmit
  * @param    {Bool} revealSenderAddress
  */
notificationPrivateMessage.record = function(senderId, recipientId, message, revealSenderAddress, sendCopyToSender) {
	check(senderId, String);
	check(recipientId, String);
	check(message, String);
	check(revealSenderAddress, Boolean);
	check(sendCopyToSender, Boolean);

	const recipients = [recipientId];
	if (sendCopyToSender) {
		let sender = Users.findOne(senderId);
		if (!sender) throw new Meteor.Error(404, "Sender not found");

		const senderAddress = sender.emailAddress();
		if (senderAddress) {
			recipients.push(senderId);
		} else {
			throw new Meteor.Error(404, "Sender has no email address");
		}
	}

	var body =
		{ message: message
		, sender: senderId
		, recipients: recipients
		, targetRecipient: recipientId
		, revealSenderAddress: revealSenderAddress
		, model: 'PrivateMessage'
		};

	Log.record('Notification.Send', [senderId, recipientId], body);
};


notificationPrivateMessage.Model = function(entry) {
	const body = entry.body;
	const sender = Meteor.users.findOne(body.sender);
	const targetRecipient = Meteor.users.findOne(body.targetRecipient);

	return {
		vars: function(userLocale, actualRecipient) {
			if (!sender) throw "Sender does not exist (0.o)";
			if (!targetRecipient) throw "targetRecipient does not exist (0.o)";

			const subjectvars =
				{ SENDER: StringTools.truncate(sender.username, 10)
				};
			const subject = mf('notification.privateMessage.mail.subject', subjectvars, "Private message from {SENDER}", userLocale);
			const htmlizedMessage = HtmlTools.plainToHtml(entry.body.message);

			// Find out whether this is the copy sent to the sender.
			const senderCopy = sender._id === actualRecipient._id;

			const vars =
			    { sender: sender
				, senderLink: Router.url('userprofile', sender)
				, subject: subject
				, message: htmlizedMessage
				, senderCopy: senderCopy
				, recipientName: targetRecipient.username
			    };

			if (!senderCopy && body.revealSenderAddress) {
				const senderAddress = sender.verifiedEmailAddress();
				if (senderAddress) {
					vars.fromAddress = senderAddress;
				} else {
					throw new Meteor.Error(400, "no verified email address");
				}
			}

			return vars;
		},
		template: "notificationPrivateMessageMail"
	};
};
