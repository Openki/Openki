import { check } from 'meteor/check';

import { CourseDiscussions } from '/imports/api/course-discussions/course-discussions';

import { ServerPublish } from '/imports/utils/ServerPublish';

export const forCourse = ServerPublish('discussion', (courseId: string) => {
	check(courseId, String);

	return CourseDiscussions.find({ courseId });
});
