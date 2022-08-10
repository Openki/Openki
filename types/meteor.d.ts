import { Mongo } from 'meteor/mongo';
import { UserModel } from '/imports/api/users/users';

declare module 'meteor/meteor' {
	namespace Meteor {
		interface User {
			locale: string;
		}
		function callAsync(name: string, ...args: any[]): Promise<any>;

		function user(options?: { fields?: Mongo.FieldSpecifier }): UserModel | null;
	}
}
