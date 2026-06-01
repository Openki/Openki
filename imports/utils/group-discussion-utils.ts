import { GroupMemberEntity } from "/imports/api/groups/groups";
import { UserModel } from "/imports/api/users/users";
import { hasRoleUser } from "./group-role-utils";

export function mayDeletePost(
  user: UserModel | undefined | null,
  group: { members: GroupMemberEntity[] },
  post: { userId?: string },
) {
  if (!user) {
    return false;
  }
  return (
    user.privileged("admin") /* is admin */ ||
    hasRoleUser(group.members, "team", user._id) /* is in team of group */ ||
    post.userId === user._id // is creator
  );
}

export function mayEditPost(user: { _id: string } | undefined | null, post: { userId?: string }) {
  if (!user || !post.userId) {
    return false;
  }
  return post.userId === user._id;
}
