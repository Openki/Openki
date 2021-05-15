import { check } from 'meteor/check';

import { Users } from '/imports/api/users/users';

/**
 * @param {string} prefix
 * @param {{ limit?: number; exclude?: string[]; fields?: any; }} [options]
 */
export function userSearchPrefix(prefix, options = {}) {
	const prefixExp = `^${prefix.replace(/([.*+?^${}()|[\]/\\])/g, '\\$1')}`;
	const query = { username: new RegExp(prefixExp, 'i') };

	const customizedOptions = options;
	const { exclude } = options;
	if (exclude !== undefined) {
		check(exclude, [String]);
		query._id = { $nin: exclude };
		delete customizedOptions.exclude;
	}

	return Users.find(query, customizedOptions);
}

export default userSearchPrefix;
