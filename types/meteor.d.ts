import { Mongo } from "meteor/mongo";
import { UserModel } from "/imports/api/users/users";

declare module "meteor/meteor" {
  namespace Meteor {
    interface User {
      locale: string;
    }

    function user(options?: { projection?: Mongo.FieldSpecifier }): UserModel | null;
  }
}
