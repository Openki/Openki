import { Meteor } from 'meteor/meteor';
import { CourseDiscussions } from '/imports/api/course-discussions/course-discussions';

Meteor.publish(
	'discussion',
	/** @param {string} courseId */ (courseId) => CourseDiscussions.find({ courseId }),
);
