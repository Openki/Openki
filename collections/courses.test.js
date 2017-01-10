/* jshint -W024 */
/* jshint expr:true */

import { expect } from 'meteor/practicalmeteor:chai';
import './courses.js';

// This should not be here
msgfmt.init('en');

describe('Role check', function() {
	var members =
		[ { user: 'user1', roles: [ 'role1', 'role1000' ] }
		, { user: 'user2', roles: [ 'role2', 'role1000' ] }
		, { user: 'user3', roles: [ 'role3' ] }
		, { user: 'anonuser', roles: [ 'role3000' ] }
		, { user: 'nobody', roles: [] }
		];

	Meteor.user = function() { return { _id: 'user5', anonId: [ 'anonuser' ] }; };

	it("should see roles that exist", function() {
		expect(hasRole(members, 'role1')).to.be.true;
		expect(hasRole(members, 'role1000')).to.be.true;
    });

	it("should not see roles that don't exist", function() {
		expect(hasRole(members, 'role4000')).to.be.false;
		expect(hasRole(members, '')).to.be.false;
    });

	it("should see member as subscribed", function() {
		expect(hasRoleUser(members, 'role1', 'user1')).to.equal('subscribed');
		expect(hasRoleUser(members, 'role1000', 'user2')).to.equal('subscribed');
    });

	it("should see anon subscription for logged-in user", function() {
		expect(hasRoleUser(members, 'role3000', 'user5')).to.equal('anon');
    });

	it("should not see roles that don't exist", function() {
		expect(hasRoleUser(members, 'role1', 'user2')).to.be.false;
		expect(hasRoleUser(members, 'role1000', 'user3')).to.be.false;
		expect(hasRoleUser(members, '', 'nobody')).to.be.false;
    });

	it("should not see roles when member list is empty", function() {
		expect(hasRole(members, 'role4000')).to.be.false;
		expect(hasRole(members, '')).to.be.false;
		expect(hasRoleUser([], 'role1', 'user2')).to.be.false;
		expect(hasRoleUser([], 'role1000', 'user3')).to.be.false;
		expect(hasRoleUser([], '', 'nobody')).to.be.false;
    });
});
