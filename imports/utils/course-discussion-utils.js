import { HasRoleUser } from '/imports/utils/course-role-utils';
import UserPrivilegeUtils from '/imports/utils/user-privilege-utils';

const CourseDiscussionUtils = {
	mayDeletePost(user, course, post) {
		if (!user) return false;
		return user && (UserPrivilegeUtils.privileged(user, 'admin') || HasRoleUser(course.members, 'team', user._id) || (post.userId === user._id));
	},

	mayEditPost(user, post) {
		if (!user) return false;
		return user && post.userId === user._id;
	},
};

export default CourseDiscussionUtils;
