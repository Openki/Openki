import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

// ======== DB-Model: ========
// "_id"            -> ID
// "sender"         -> User ID
// "content"        -> String
// "timeCreated"    -> Date
// "conversation"   -> Conversation ID
// ===========================

class UserMessage {
	constructor(dbDocument) { Object.assign(this, dbDocument); }

	/** Check if it has been sent by the currently logged in user
	  *
	  * @returns {Boolean}
	  */
	sentByOwnUser() { return this.sender === Meteor.userId(); }
}

export default UserMessages = new Mongo.Collection('UserMessages', {
	transform: (dbDocument) => new UserMessage(dbDocument)
});
