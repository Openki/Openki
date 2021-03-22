import { Meteor } from 'meteor/meteor';

/**
 * @param {string} prefix
 * @param {{ limit?: number; exclude?: string[]; fields?: any; }} [options]
 */
export default function UserSearchPrefix(prefix, options = {}) {
	const prefixExp = `^${prefix.replace(/([.*+?^${}()|[\]/\\])/g, '\\$1')}`;
	const query = { username: new RegExp(prefixExp, 'i') };

	const customizedOptions = options;
	const { exclude } = options;
	if (exclude !== undefined) {
		check(exclude, [String]);
		query._id = { $nin: exclude };
		delete customizedOptions.exclude;
	}

	return Meteor.users.find(query, customizedOptions);
}
