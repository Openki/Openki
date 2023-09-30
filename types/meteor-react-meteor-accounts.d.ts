import { UserModel } from "/imports/api/users/users";

declare module "meteor/react-meteor-accounts" {
  export declare function useUser(): UserModel | null;
}
