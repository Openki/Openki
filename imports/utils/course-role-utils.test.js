/* jshint -W024 */
/* jshint expr:true */

import { expect } from 'chai';
import { HasRole, HasRoleUser } from '/imports/utils/course-role-utils.js';

// This should not be here
msgfmt.init('en');

describe('Role check', function() {
	var members =
		[ { user: 'user1', roles: [ 'role1', 'role1000' ] }
		, { user: 'user2', roles: [ 'role2', 'role1000' ] }
		, { user: 'user3', roles: [ 'role3' ] }
		, { user: 'nobody', roles: [] }
		];

	it("should see roles that exist", function() {
		expect(HasRole(members, 'role1')).to.be.true;
		expect(HasRole(members, 'role1000')).to.be.true;
    });

	it("should not see roles that don't exist", function() {
		expect(HasRole(members, 'role4000')).to.be.false;
		expect(HasRole(members, '')).to.be.false;
    });

	it("should see member as subscribed", function() {
		expect(HasRoleUser(members, 'role1', 'user1')).to.be.true;
		expect(HasRoleUser(members, 'role1000', 'user2')).to.be.true;
    });

	it("should not see roles that don't exist", function() {
		expect(HasRoleUser(members, 'role1', 'user2')).to.be.false;
		expect(HasRoleUser(members, 'role1000', 'user3')).to.be.false;
		expect(HasRoleUser(members, '', 'nobody')).to.be.false;
    });

	it("should not see roles when member list is empty", function() {
		expect(HasRole(members, 'role4000')).to.be.false;
		expect(HasRole(members, '')).to.be.false;
		expect(HasRoleUser([], 'role1', 'user2')).to.be.false;
		expect(HasRoleUser([], 'role1000', 'user3')).to.be.false;
		expect(HasRoleUser([], '', 'nobody')).to.be.false;
    });
});
