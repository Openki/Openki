import { HasRoleUser } from '/imports/utils/course-role-utils';
import * as UserPrivilegeUtils from '/imports/utils/user-privilege-utils';

const CourseDiscussionUtils = {
	mayDeletePost(user, course, post) {
		if (!user) {
			return false;
		}
		return UserPrivilegeUtils.privileged(user, 'admin') // is admin
			|| HasRoleUser(course.members, 'team', user._id) // is in team of course
			|| (post.userId === user._id); // is creator
	},

	mayEditPost(user, post) {
		if (!user) {
			return false;
		}
		return post.userId === user._id;
	},
};

export default CourseDiscussionUtils;
