import { Meteor } from 'meteor/meteor';
import { Courses } from '../courses';
import { visibleTenants } from '/imports/utils/visible-tenants';

Meteor.publish('courseDetails', (id) =>
	Courses.find({ _id: id, tenant: { $in: visibleTenants() } }),
);

Meteor.publish('Courses.findFilter', (filter, limit, skip, sortParams) =>
	Courses.findFilter({ ...filter, tenants: visibleTenants() }, limit, skip, sortParams),
);
