import { GroupMember } from "/imports/api/groups/groups";
import { UserModel } from "/imports/api/users/users";
import { hasRoleUser } from "../api/groups/lib/hasRole";
import { SystemRoles } from "/imports/api/groups/lib/Role";

export function canDeletePost(
  user: UserModel | undefined | null,
  group: { members: GroupMember[] },
  post: { userId?: string },
) {
  if (!user) {
    return false;
  }
  return (
    user.hasPrivilege("admin") /* is admin */ ||
    hasRoleUser(group.members, SystemRoles.Team, user._id) /* is in team of group */ ||
    post.userId === user._id // is creator
  );
}

export function canEditPost(user: { _id: string } | undefined | null, post: { userId?: string }) {
  if (!user || !post.userId) {
    return false;
  }
  return post.userId === user._id;
}
