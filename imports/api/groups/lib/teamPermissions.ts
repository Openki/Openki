import { GroupModel } from "/imports/api/groups/groups";
import { hasRole } from "/imports/api/groups/lib/hasRole";
import { SystemRoles } from "/imports/api/groups/lib/Role";
import { UserModel } from "/imports/api/users/users";

export function canSubscribeToTeam(group: GroupModel, user: UserModel) {
  // Do not allow subscribing when already subscribed
  if (group.userHasRole(user._id, SystemRoles.Team)) {
    return false;
  }

  // Admins can subscribe to all roles
  if (user.hasPrivilege("admin")) {
    return true;
  }

  // If there are no team-members, anybody can join
  if (!hasRole(group.members, SystemRoles.Team)) {
    return true;
  }

  return false;
}

export function canAddToTeam(operator: UserModel | null, group: GroupModel, userId: string) {
  if (!operator) {
    return false;
  }

  // Do not allow subscribing when already subscribed
  if (group.userHasRole(userId, SystemRoles.Team)) {
    return false;
  }

  // Admins can add others
  if (operator.hasPrivilege("admin")) {
    return true;
  }

  // and members of the team can take-on other people
  if (group.userHasRole(operator._id, SystemRoles.Team)) {
    return true;
  }

  return false;
}

export function canRemoveFromTeam(operator: UserModel | null, group: GroupModel, userId: string) {
  if (!operator) {
    return false;
  }

  // Do not allow unsubscribing when not subscribed
  if (!group.userHasRole(userId, SystemRoles.Team)) {
    return false;
  }

  // Admins can do anything
  if (operator.hasPrivilege("admin")) {
    return true;
  }

  // Members of the team can take-out other people
  // The nuclear option. We'll have to reconsider this!
  if (group.userHasRole(operator._id, SystemRoles.Team)) {
    return true;
  }

  return false;
}
