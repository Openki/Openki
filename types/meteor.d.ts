import { Mongo } from "meteor/mongo";
import { UserModel } from "/imports/api/users/users";

declare module "meteor/meteor" {
  namespace Meteor {
    interface User {
      locale: string;
    }

    function user(options?: { fields?: Mongo.FieldSpecifier | undefined }): UserModel | null;
    function userAsync(options?: {
      fields?: Mongo.FieldSpecifier | undefined;
    }): Promise<UserModel | null>;
  }
}
