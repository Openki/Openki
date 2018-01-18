import Conversations from './conversations.js';

Meteor.methods({
	'conversation.add'(sender, recipients, latestMessage) {
		check(sender, String);
		check(recipients, [String]);
		check(latestMessage, String);


		// create the participant objects
		const participants = recipients.map((id) => ({ id, unread: 1 }));
		// and add the sender too but with no unread messages
		participants.push({ id: sender, unread: 0 });

		const conversationId = Conversations.insert(
			{ participants
			, latestMessage
			, timeUpdated: new Date()
			}
		);

		return conversationId;
	},

	'conversation.remove'(conversationId) {
		check(conversationId, String);

		Conversations.remove(conversationId);
	},

	'conversation.resetUnread'(conversationId) {
		check(conversationId, String);

		Conversations.update(
			{ _id: conversationId, 'participants.id': Meteor.userId() },
			{ $set:	{ 'participants.$.unread': 0 } }
		);
	},

	'conversation.markAsRead'(conversationId) {
		check(conversationId, String);

		Conversations.update(
			{ _id: conversationId, 'participants.id': Meteor.userId() },
			{ $set:
				{ 'participants.$.readAt': new Date()
				, 'participants.$.unread': 0
				}
			}
		);
	},

	'conversation.mute'(conversationId, mute = true) {
		check(conversationId, String);
		check(mute, Boolean);

		Conversations.update(
			{ _id: conversationId, 'participants.id': Meteor.userId() },
			{ $set:	{ 'participants.$.muted': mute } }
		);
	}
});
