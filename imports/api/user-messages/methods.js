import { Meteor } from 'meteor/meteor';

import Conversations from '../conversations/conversations.js';
import UserMessages from './user-messages.js';

Meteor.methods({
	'userMessage.add'(recipients, content) {
		check(recipients, Match.OneOf(String, [String]));
		check(content, String);

		// if a single recipient has been passed, put recipient into an array
		if (typeof recipients === 'string') recipients = [recipients];

		const sender = Meteor.userId();
		const participantIds = recipients.concat([sender]);
		const now = new Date();

		// start building the message document
		const set = { sender, content, timeCreated: now	};

		// Check if there's already a conversation with these users.
		// If not create one.
		const existingConversation = Conversations.findOne({ $and:
			participantIds.map((id) => (
				{ 'participants.id': { $in: [id] } }
			))
		});

		if (existingConversation) {
			set.conversation = existingConversation._id;
		}

		const messageId = UserMessages.insert(set);

		if (existingConversation) {
			Conversations.update(
				{ _id: existingConversation._id
				, 'participants.id': { $in: recipients }
				},
				{ $set:	{ latestMessage: messageId, timeUpdated: now }
			 	, $inc:	{ 'participants.$.unread': 1 }
				}
			);
		} else {
			Meteor.call(
				'conversation.add',
				sender,
				recipients,
				messageId,
				(err, conversationId) => {
					if (err) {
						console.error(err);
					} else {
						UserMessages.update(
							messageId,
							{ $set: { conversation: conversationId } }
						);
					}
				}
			);
		}

		let usersToUpdate = recipients;
		if (existingConversation) {
			usersToUpdate = usersToUpdate.filter((userId) => {
				return !existingConversation.isMutedByUser(userId);
			});
		}

		Meteor.call('user.updateInbox', usersToUpdate);
	}
});
