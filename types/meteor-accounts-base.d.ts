import { Meteor } from "meteor/meteor";

import { UserModel } from "/imports/api/users/users";

declare module "meteor/accounts-base" {
  namespace Accounts {
    function validateNewUser(func: (user: UserModel) => boolean): boolean;

    function removeDefaultRateLimit(): void;

    class LoginCancelledError extends Meteor.Error {}
  }
}
