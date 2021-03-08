import { Meteor } from 'meteor/meteor';
import Courses from '../courses';

Meteor.publish('courseDetails', (id) => Courses.find({ _id: id, tenant: { $in: Meteor.user()?.tenants || [] } }));

Meteor.publish('Courses.findFilter', (filter, limit, sortParams) => Courses.findFilter(filter, limit, sortParams));
