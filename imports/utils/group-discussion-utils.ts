import { GroupMemberEntity } from "../api/groups/groups";
import { UserModel } from "/imports/api/users/users";
import { hasRoleUser } from "./group-role-utils";

export function mayDeletePost(
  user: UserModel | undefined | null,
  course: { members: GroupMemberEntity[] },
  post: { userId?: string },
) {
  if (!user) {
    return false;
  }
  return (
    user.privileged("admin") /* is admin */ ||
    hasRoleUser(course.members, "team", user._id) /* is in team of course */ ||
    post.userId === user._id // is creator
  );
}

export function mayEditPost(user: { _id: string } | undefined | null, post: { userId?: string }) {
  if (!user || !post.userId) {
    return false;
  }
  return post.userId === user._id;
}
