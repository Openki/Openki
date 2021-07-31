import { check } from 'meteor/check';

import { UserEntity, Users } from '/imports/api/users/users';

export function userSearchPrefix(
	prefix: string,
	options: { limit?: number; exclude?: string[]; fields?: any } = {},
) {
	const prefixExp = `^${prefix.replace(/([.*+?^${}()|[\]/\\])/g, '\\$1')}`;
	const query: Mongo.Selector<UserEntity> = { username: new RegExp(prefixExp, 'i') };

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
