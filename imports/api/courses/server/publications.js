import { Meteor } from 'meteor/meteor';

import { Courses } from '../courses';

Meteor.publish('courseDetails', (id) => Courses.find({ _id: id }));

Meteor.publish('Courses.findFilter', (filter, limit, sortParams) => Courses.findFilter(filter, limit, sortParams));
