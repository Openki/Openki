import { Meteor } from 'meteor/meteor';
import CourseDiscussions from '/imports/api/course-discussions/course-discussions.js';

Meteor.publish('discussion', (courseId) => CourseDiscussions.find({ courseId }));
