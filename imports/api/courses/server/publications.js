import { Meteor } from 'meteor/meteor';
import Courses from '../courses';

Meteor.publish('courseDetails', (id) => Courses.find({ _id: id, tenant: { $in: Meteor.user()?.tenants || [] } }));

Meteor.publish('Courses.findFilter', Courses.findFilter);
