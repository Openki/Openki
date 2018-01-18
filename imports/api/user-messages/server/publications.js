import { Meteor } from 'meteor/meteor';

import UserMessages from '../user-messages.js';

Meteor.publish('userMessages.latest', (messageId) => {
	check(messageId, String);
	return UserMessages.find({ _id: messageId });
});

Meteor.publish('userMessages.fullConversation', (conversationId) => {
	check(conversationId, String);
	return UserMessages.find({ conversation: conversationId });
});
