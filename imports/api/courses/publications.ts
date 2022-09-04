import { check } from 'meteor/check';

import { Courses } from '/imports/api/courses/courses';

import { ServerPublish } from '/imports/utils/ServerPublish';
import { visibleTenants } from '/imports/utils/visible-tenants';

export const details = ServerPublish('courseDetails', (id: string) => {
	check(id, String);

	return Courses.find({ _id: id, tenant: { $in: visibleTenants() } });
});

export const findFilter = ServerPublish('Courses.findFilter', (filter, limit, skip, sortParams) =>
	Courses.findFilter({ ...filter, tenants: visibleTenants() }, limit, skip, sortParams),
);
