import { Meteor } from 'meteor/meteor';
import { CourseDiscussions } from '/imports/api/course-discussions/course-discussions';

Meteor.publish('discussion', (courseId: string) => CourseDiscussions.find({ courseId }));
