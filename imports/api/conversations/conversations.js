import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

// ======== DB-Model: ========
// "_id"            -> ID
// "participants"   -> [{
//    "id"          -> User ID
//    "unread"      -> Integer (Counter for unread messages)
//    "readAt"      -> Date
//    "muted"       -> Boolean
// }]
// "timeUpdated"    -> Date
// "latestMessage"  -> UserMessage ID
// ===========================

class Conversation {
	constructor(dbDocument) { Object.assign(this, dbDocument); }

	otherParticipants() {
		return this.participants.filter((p) => p.id !== Meteor.userId());
	}

	isMutedByUser(userId = Meteor.userId()) {
		return this.participants.find((p) => p.id === userId).muted;
	}
}

export default Conversations = new Mongo.Collection('Conversations', {
	transform: (dbDocument) => new Conversation(dbDocument)
});
