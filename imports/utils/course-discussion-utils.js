import { hasRoleUser } from '/imports/utils/course-role-utils';
import * as UserPrivilegeUtils from '/imports/utils/user-privilege-utils';

/** @typedef {import("imports/api/courses/courses").CourseMemberEntity} CourseMemberEntity */
/** @typedef {import('imports/api/users/users').UserModel} UserModel */

/**
 * @param {UserModel|undefined|null} user
 * @param {{ members: CourseMemberEntity[] }} course
 * @param {{ userId: string; }} post
 */
export function mayDeletePost(user, course, post) {
	if (!user) {
		return false;
	}
	return (
		UserPrivilegeUtils.privileged(user, 'admin') /* is admin */ ||
		hasRoleUser(course.members, 'team', user._id) /* is in team of course */ ||
		post.userId === user._id // is creator
	);
}

/**
 * @param {{ _id: string; } | undefined | null} user
 * @param {{ userId: string; }} post
 */
export function mayEditPost(user, post) {
	if (!user) {
		return false;
	}
	return post.userId === user._id;
}
