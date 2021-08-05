import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';

import * as IdTools from '/imports/utils/id-tools';

import { GroupEntity } from '../groups/groups';

export type Role = 'admin';

export interface UserEntity extends Meteor.User {
	/** ID */
	_id: string;
	tenants: { _id: string; privileges: string[] }[];
	createdAt: Date;
	services: {
		password: {
			bcrypt: string;
		};
		github: {
			/** Int32 */
			id: number;
			accessToken: string;
			email: string | null;
			username: string;
		};
		facebook: {
			accessTocken: string;
			/** Double */
			expiresAt: number;
			id: string;
			/** (not allways) */
			email: string;
			name: string;
			// eslint-disable-next-line camelcase
			first_name: string;
			// eslint-disable-next-line camelcase
			last_name: string;
			link: string;
			gender: string;
			/** ex: de_DE, en_US */
			locale: string;
		};
		google: {
			accessTocken: string;
			idTocken: string;
			/** Double */
			expiresAt: number;
			id: string;
			email: string;
			// eslint-disable-next-line camelcase
			verified_email: boolean;
			name: string;
			// eslint-disable-next-line camelcase
			given_name: string;
			// eslint-disable-next-line camelcase
			family_name: string;
			/** (link) */
			picture: string;
			/** ex: de */
			locale: string;
			/** [https://www.googleapis.com/auth/userinfo.email, https://www.googleapis.com/auth/userinfo.profile] */
			scope: string[];
		};
		resume: {
			loginTockens: {
				when: Date;
				hashed: string;
			}[];
		};
	};
	username: string;
	emails: {
		address: string;
		verified: boolean;
	}[];
	profile: {
		name: string;
		regionId: string;
	};
	/** [admin] */
	privileges: Role[];

	/**
	 * Has openki donated/supported. The Date is when an admin clicked the button in the user
	 * profile. The contribution is
	 */
	contribution?: Date;

	lastLogin: Date;
	/** This value is managed by the messageformat package */
	locale: string;
	/** True if the user wants automated notification mails sent to them */
	notifications: boolean;
	/** True if the user wants private messages mails sent to them from other users */
	allowPrivateMessages: boolean;
	hidePricePolicy: boolean;
	description: string;
	avatar: {
		color: number;
	};
	/**
	 * (calculated) union of user's id and group ids for permission checking, calculated by
	 * updateBadges()
	 */
	badges: string[];
	/** (calculated) List of groups the user is a member of, calculated by updateBadges() */
	groups: string[];
	/**
	 * (calculated) true if user has email address and the allowPrivateMessages flag is
	 * true. This is visible to other users.
	 */
	acceptsPrivateMessages: boolean;
}

export type UserModel = User & UserEntity;

export class User {
	/**
	 * Check whether the user may promote things with the given group.
	 * The user must be a member of the group to be allowed to promote things with it.
	 *
	 * @param group The group to check, this may be an Id or a group object
	 */
	mayPromoteWith(this: UserModel, group: string | GroupEntity) {
		const groupId = IdTools.extract(group);
		if (!groupId || !this.groups) {
			return false;
		}
		return this.groups.includes(groupId);
	}

	hasEmail(this: UserModel) {
		return !!this.emails?.[0]?.address;
	}

	hasVerifiedEmail(this: UserModel) {
		return !!this.emails?.[0]?.verified && !!this.emails?.[0]?.address;
	}

	/**
	 * Get email address of user
	 * @returns String with email address or Boolean false
	 */
	emailAddress(this: UserModel) {
		return this.emails?.[0]?.address || false;
	}

	/**
	 * Get verified email address of user
	 * @returns String with verified email address or Boolean false
	 */
	verifiedEmailAddress(this: UserModel) {
		const emailRecord = this.emails?.[0];
		return (emailRecord && emailRecord.verified && emailRecord.address) || false;
	}

	privileged(this: UserModel, role: Role) {
		return !!this.privileges?.includes(role);
	}

	isTenantAdmin(this: UserModel, tenantId: string) {
		return (
			this.tenants?.some((t) => t._id === tenantId && t.privileges?.includes('admin')) || false
		);
	}
}

export const Users = Meteor.users as Mongo.Collection<UserEntity, UserModel> & {
	/**
	 * Get the current user
	 * @return User or if the user is not logged-in, a placeholder "anon" object is returned.
	 */
	currentUser(): UserModel | (UserModel & { anon?: true });
};

(Users as any)._transform = function (user: UserEntity) {
	return _.extend(new User(), user);
};

Users.currentUser = function () {
	const logged = Meteor.user();
	if (logged) {
		return logged;
	}

	const anon = new User() as UserModel & { anon?: true };
	anon._id = 'anon';
	anon.anon = true;
	return anon;
};

export default Users;
