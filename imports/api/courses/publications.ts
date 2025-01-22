import { check } from "meteor/check";

import { Courses, FindFilter } from "/imports/api/courses/courses";

import { ServerPublishMany, ServerPublishOne } from "/imports/utils/ServerPublish";
import { FieldSort } from "/imports/utils/sort-spec";
import { visibleTenants, visibleTenantsAsync } from "/imports/utils/visible-tenants";

export const [details, useDetails] = ServerPublishOne(
  "courseDetails",
  async (courseId: string) => {
    check(courseId, String);

    return Courses.find({ _id: courseId, tenant: { $in: await visibleTenantsAsync() } });
  },
  (courseId) => Courses.findOne({ _id: courseId, tenant: { $in: visibleTenants() } }),
);

export const [findFilter, useFindFilter] = ServerPublishMany(
  "Courses.findFilter",
  async (filter?: FindFilter, limit?: number, skip?: number, sort?: FieldSort[]) =>
    Courses.findFilter({ ...filter, tenants: await visibleTenantsAsync() }, limit, skip, sort),
  (filter?, limit?, skip?, sort?) =>
    Courses.findFilter({ ...filter, tenants: visibleTenants() }, limit, skip, sort),
);
