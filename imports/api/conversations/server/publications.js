import Conversations from '../conversations.js';

Meteor.publish('conversations', () => (
	Conversations.find({ 'participants.id': { $in: [ Meteor.userId() ] } })
));
