import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { CourseDiscussions } from '/imports/api/course-discussions/course-discussions';

Meteor.publish('discussion', (courseId: string) => {
	check(courseId, String);

	return CourseDiscussions.find({ courseId });
});
