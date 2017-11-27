import { Meteor } from 'meteor/meteor';

import Courses from '../courses.js';

Meteor.publish ('courses', function(region){
	if(!region) {
		return Courses.find();
	} else {
		return Courses.find({region: region});
	}
});

Meteor.publish ('courseDetails', function(id) {
	return Courses.find({ _id: id });
});

Meteor.publish('Courses.findFilter', Courses.findFilter);
