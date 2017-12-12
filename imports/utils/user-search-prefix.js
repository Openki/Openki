import { Meteor } from 'meteor/meteor';

export default function UserSearchPrefix(prefix, options) {
	var prefixExp = '^' + prefix.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
	var query = { username: new RegExp(prefixExp, 'i') };

	var exclude = options.exclude;
	if (exclude !== undefined) {
		check(exclude, [String]);
		query._id = { $nin: exclude };
		delete options.exclude;
	}

	return Meteor.users.find(query, options);
}
