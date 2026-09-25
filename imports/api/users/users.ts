import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { assignIn } from "lodash-es";

export type Role = "admin" | "visitor";

export interface UserProfile {
  name: string;
  regionId?: string;
}

export interface UserEntity extends Meteor.User {
  /** ID */
  _id: string;
  tenants: { _id: string; privileges?: string[] }[];
  createdAt: Date;
  services: {
    password: {
      reset: { when: Date };
      bcrypt: string;
    };
    github: {
      /** Int32 */
      id: number;
      accessToken: string;
      email: string | null;
      username: string;
    };
    facebook: {
      accessTocken: string;
      /** Double */
      expiresAt: number;
      id: string;
      /** (not allways) */
      email: string;
      name: string;

      first_name: string;

      last_name: string;
      link: string;
      gender: string;
      /** ex: de_DE, en_US */
      locale: string;
    };
    google: {
      accessTocken: string;
      idTocken: string;
      /** Double */
      expiresAt: number;
      id: string;
      email: string;

      verified_email: boolean;
      name: string;

      given_name: string;

      family_name: string;
      /** (link) */
      picture: string;
      /** ex: de */
      locale: string;
      /** [https://www.googleapis.com/auth/userinfo.email, https://www.googleapis.com/auth/userinfo.profile] */
      scope: string[];
    };
    resume: {
      loginTockens: {
        when: Date;
        hashed: string;
      }[];
    };
  };
  username: string;
  emails: {
    address: string;
    verified: boolean;
  }[];

  /** By default the server publishes `username`, `emails`, and `profile` (writable by user).
   * See: https://docs.meteor.com/api/accounts#Meteor-user*/
  profile: UserProfile;
  /** [admin] */
  privileges: Role[];

  /**
   * Has openki donated/supported. The Date is when an admin clicked the button in the user
   * profile. It shows a icon next to the user if the date is not older then a year.
   */
  contribution?: Date;

  lastLogin: Date;
  locale: string;
  /** True if the user wants automated notification mails sent to them */
  notifications: boolean;
  /** True if the user wants private messages mails sent to them from other users */
  allowPrivateMessages: boolean;
  hidePricePolicy: boolean;
  description: string;
  avatar: {
    color: number;
  };
  theme?: "light" | "system" | "dark";
  /**
   * (calculated) union of user's id and organization ids for permission checking, calculated by
   * updateBadges()
   */
  badges: string[];
  /** (calculated) List of organizations the user is a member of, calculated by updateBadges() */
  organizations: string[];

  /** (calculated) List of venues the user is a editor of */
  venues: string[];

  /** The user agrees to receive occasional e-mails. Set on create after that readonly because we past that information to email service. */
  allowNews: boolean;
}

export type UserModel = User & UserEntity;

export class User {
  getDisplayName(this: Pick<UserEntity, "username">) {
    return this.username;
  }

  /**
   * Check whether the user can promote things with the given organization.
   * The user must be a member of the organization to be allowed to promote things with it.
   *
   * @param organizationId The organization to check
   */
  canPromoteWith(this: UserModel, organizationId: string) {
    if (!organizationId || !this.organizations) {
      return false;
    }
    return this.organizations.includes(organizationId);
  }

  hasVerifiedEmail(this: UserModel) {
    return !!this.emails?.[0]?.verified && !!this.emails?.[0]?.address;
  }

  /**
   * Get email address of user
   * @returns String with email address or undefined
   */
  emailAddress(this: UserModel) {
    return this.emails?.[0]?.address || undefined;
  }

  /**
   * Get verified email address of user
   * @returns String with verified email address or undefined
   */
  verifiedEmailAddress(this: UserModel) {
    const emailRecord = this.emails?.[0];
    return (emailRecord && emailRecord.verified && emailRecord.address) || undefined;
  }

  hasPrivilege(this: UserModel, role: Role) {
    return !!this.privileges?.includes(role);
  }

  isTenantAdmin(this: UserModel, tenantId: string) {
    return (
      this.tenants?.some((t) => t._id === tenantId && t.privileges?.includes("admin")) || false
    );
  }
}

export const Users = Meteor.users as unknown as Mongo.Collection<UserEntity, UserModel>;

(Users as any)._transform = function (user: UserEntity) {
  return assignIn(new User(), user);
};
