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
notificationPrivateMessage.record = function(senderId, recipientId, message, revealSenderAddress) {
	check(senderId, String);
	check(recipientId, String);
	check(message, String);
	check(revealSenderAddress, Boolean);

	var sender = Meteor.users.findOne(senderId);
	if (!sender) throw new Meteor.Error("No user entry for sender " + recipientId);

	var recipient = Meteor.users.findOne(recipientId);
	if (!recipient) throw new Meteor.Error("No user entry for recipient " + recipientId);

	var body = {};
	body.message = message;
	body.sender = sender._id;
	body.recipients = [recipient._id];
	body.revealSenderAddress = revealSenderAddress;

	body.model = 'PrivateMessage';

	Log.record('Notification.Send', [sender._id, recipient._id], body);
};


notificationPrivateMessage.Model = function(entry) {
	var sender = Meteor.users.findOne(senderId);
	var recipient = Meteor.users.findOne(recipientId);

	return {
		vars: function(userLocale) {
			if (!sender) throw "Sender does not exist (0.o)";
			if (!recipient) throw "Recipient does not exist (0.o)";

			var subjectvars =
				{ SENDER: StringTools.truncate(sender.username, 10)
				};

			var subject = mf('notification.privateMessage.mail.subject', subjectvars, "Private message from {SENDER}", userLocale);

			var htmlizedMessage = HtmlTools.plainToHtml(entry.body.message);
			return (
			    { sender: sender
				, senderLink: Router.url('userprofile', sender)
				, subject: subject
				, message: entry.body.message
				}
			);
		},
		template: "notificationPrivateMessageMail"
	};
}
