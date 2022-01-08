import { CourseMemberEntity } from '/imports/api/courses/courses';
import { UserModel } from '/imports/api/users/users';
import { hasRoleUser } from '/imports/utils/course-role-utils';
import * as UserPrivilegeUtils from '/imports/utils/user-privilege-utils';

export function mayDeletePost(
	user: UserModel | undefined | null,
	course: { members: CourseMemberEntity[] },
	post: { userId?: string },
) {
	if (!user || !post.userId) {
		return false;
	}
	return (
		UserPrivilegeUtils.privileged(user, 'admin') /* is admin */ ||
		hasRoleUser(course.members, 'team', user._id) /* is in team of course */ ||
		post.userId === user._id // is creator
	);
}

export function mayEditPost(user: { _id: string } | undefined | null, post: { userId?: string }) {
	if (!user || !post.userId) {
		return false;
	}
	return post.userId === user._id;
}
