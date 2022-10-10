import { check } from 'meteor/check';

import { Courses, FindFilter } from '/imports/api/courses/courses';

import { ServerPublish } from '/imports/utils/ServerPublish';
import { FieldSort } from '/imports/utils/sort-spec';
import { visibleTenants } from '/imports/utils/visible-tenants';

export const details = ServerPublish(
	'courseDetails',
	(courseId: string) => {
		check(courseId, String);

		return Courses.find({ _id: courseId, tenant: { $in: visibleTenants() } });
	},
	(courseId: string) => Courses.findOne({ _id: courseId, tenant: { $in: visibleTenants() } }),
);

export const findFilter = ServerPublish(
	'Courses.findFilter',
	(filter?: FindFilter, limit?: number, skip?: number, sort?: FieldSort[]) =>
		Courses.findFilter({ ...filter, tenants: visibleTenants() }, limit, skip, sort),
);
