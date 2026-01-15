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

    function loginWithC3(
      options?:
        | (Meteor.LoginWithExternalServiceOptions & {
            loginUrlParameters?: {
              include_granted_scopes: boolean;
            };
          })
        | undefined,
      callback?: (error?: global_Error | Meteor.Error | Meteor.TypedError) => void,
    ): void;
  }
}
