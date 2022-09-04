import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Courses } from '/imports/api/courses/courses';
import { visibleTenants } from '/imports/utils/visible-tenants';

Meteor.publish('courseDetails', (id: string) => {
	check(id, String);

	return Courses.find({ _id: id, tenant: { $in: visibleTenants() } });
});

Meteor.publish('Courses.findFilter', (filter, limit, skip, sortParams) =>
	Courses.findFilter({ ...filter, tenants: visibleTenants() }, limit, skip, sortParams),
);
