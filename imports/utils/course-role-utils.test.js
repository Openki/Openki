/* eslint no-unused-expressions: 0 */

import { expect } from 'chai';
import { hasRole, hasRoleUser } from '/imports/utils/course-role-utils';

// This should not be here
msgfmt.init('en');

describe('Role check', () => {
	const members = [{ user: 'user1', roles: ['role1', 'role1000'] },
		{ user: 'user2', roles: ['role2', 'role1000'] },
		{ user: 'user3', roles: ['role3'] },
		{ user: 'nobody', roles: [] },
	];

	it('should see roles that exist', () => {
		expect(hasRole(members, 'role1')).to.be.true;
		expect(hasRole(members, 'role1000')).to.be.true;
	});

	it("should not see roles that don't exist", () => {
		expect(hasRole(members, 'role4000')).to.be.false;
		expect(hasRole(members, '')).to.be.false;
		expect(hasRole(members, undefined)).to.be.false;
	});

	it('should see member as subscribed', () => {
		expect(hasRoleUser(members, 'role1', 'user1')).to.be.true;
		expect(hasRoleUser(members, 'role1000', 'user2')).to.be.true;
	});

	it('should not see user that are not subscribed', () => {
		expect(hasRoleUser(members, 'role1', 'userNotExists')).to.be.false;
		expect(hasRoleUser(members, 'role1000', '')).to.be.false;
		expect(hasRoleUser(members, 'role1000', undefined)).to.be.false;
	});

	it("should not see roles that don't exist", () => {
		expect(hasRoleUser(members, 'role1', 'user2')).to.be.false;
		expect(hasRoleUser(members, 'role1000', 'user3')).to.be.false;
		expect(hasRoleUser(members, '', 'nobody')).to.be.false;
	});

	it('should not see roles when member list is empty', () => {
		expect(hasRole([], 'role4000')).to.be.false;
		expect(hasRole([], '')).to.be.false;
		expect(hasRole([], undefined)).to.be.false;
		expect(hasRoleUser([], 'role1', 'user2')).to.be.false;
		expect(hasRoleUser([], 'role1000', 'user3')).to.be.false;
		expect(hasRoleUser([], '', 'nobody')).to.be.false;
	});
});
