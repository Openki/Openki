import { Meteor } from 'meteor/meteor';

import IdTools from '/imports/utils/id-tools.js';

// ======== DB-Model: ========
// "_id"          -> ID
// "createdAt"    -> Date
// "services"     -> {
//     password: {
//         bcrypt:       String},
//     github: {
//         id:           Int32
//         accessToken:  String
//         email:        String/null
//         username:     String }
//     facebook: {
//         accessTocken: String
//         expiresAt:    Double
//         id:           String
//         email:        String       (not allways)
//         name:         String
//         first_name:   String
//         last_name:    String
//         link:         String
//         gender:       String
//         locale:       String }     ex: de_DE, en_US
//     google: {
//         accessTocken: String
//         idTocken:     String
//         expiresAt:    Double
//         id:           String
//         email:        String
//         verified_email:Boolean
//         name:         String
//         given_name:   String
//         family_name:  String
//         picture:      String       (link)
//         locale:       String }      ex: de
//         scope:        [https://www.googleapis.com/auth/userinfo.email, https://www.googleapis.com/auth/userinfo.profile]
//     resume: {
//         loginTockens: [{when: Date, hashed: String}]}}
// "username"     -> String
// "emails"       -> [{address: String, verified: Boolean}]
// "profile"      -> {name: String, locale: Lang, regionId: ID}
// "privileges"   -> [admin]
// "lastLogin"    -> Date
// notificactions: True if the user wants notification mails sent to them

// Calculated fields
// badges: union of user's id and group ids for permission checking, calculated by updateBadges()
// groups: List of groups the user is a member of, calculated by updateBadges()
// acceptsMessages: true if user has email address and the notifications flag is true. This is visible to other users.

export default Users = Meteor.users;

User = function() {};

/** Check whether the user may promote things with the given group
  *
  * @param {String/Object} group - The group to check, this may be an Id or a group object
  * @returns {Boolean}
  *
  * The user must be a member of the group to be allowed to promote things with it.
  */
User.prototype.mayPromoteWith = function(group) {
	var groupId = IdTools.extract(group);
	if (!groupId) return false;
	return this.groups.indexOf(groupId) >= 0;
};

/** Get email address of user
  *
  * @returns String with email address or Boolean false
  */
User.prototype.emailAddress = function() {
	return this.emails
	    && this.emails[0]
		&& this.emails[0].address
		|| false;
};

/** Get verified email address of user
  *
  * @returns String with verified email address or Boolean false
  */
User.prototype.verifiedEmailAddress = function() {
	let emailRecord = this.emails
	               && this.emails[0];
	return emailRecord
	    && emailRecord.verified
		&& emailRecord.address
		|| false;
};

Meteor.users._transform = function(user) {
	return _.extend(new User(), user);
};
