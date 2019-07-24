import { Meteor } from 'meteor/meteor';

import Courses from '../courses';

Meteor.publish('courses', (region) => {
	if (!region) {
		return Courses.find();
	}
	return Courses.find({ region });
});

Meteor.publish('courseDetails', id => Courses.find({ _id: id }));

Meteor.publish('Courses.findFilter', Courses.findFilter);
