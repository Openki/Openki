import { Mongo } from "meteor/mongo";
import { check } from "meteor/check";

import { UserEntity, Users } from "/imports/api/users/users";

export function userSearchPrefix(
  prefix: string,
  options: {
    limit?: number | undefined;
    exclude?: string[] | undefined;
    projection?: Mongo.FieldSpecifier | undefined;
  } = {},
) {
  const prefixExp = `^${prefix.replace(/([.*+?^${}()|[\]/\\])/g, "\\$1")}`;
  const query: Mongo.Selector<UserEntity> = { username: new RegExp(prefixExp, "i") };

  const { exclude, ...customizedOptions } = options;
  if (exclude) {
    check(exclude, [String]);
    query._id = { $nin: exclude };
  }

  return Users.find(query, customizedOptions);
}
