import { check } from "meteor/check";

import { Courses, FindFilter } from "/imports/api/courses/courses";

import { ServerPublishMany, ServerPublishOne } from "/imports/utils/ServerPublish";
import { FieldSort } from "/imports/utils/sort-spec";
import { visibleTenants } from "/imports/utils/visible-tenants";
import { SafeString } from "/imports/utils/CustomChecks";

export const [details, useDetails] = ServerPublishOne(
  "courseDetails",
  (courseId: string) => {
    check(courseId, SafeString());

    return Courses.find({ _id: courseId, tenant: { $in: visibleTenants() } });
  },
  (courseId: string) => Courses.findOne({ _id: courseId, tenant: { $in: visibleTenants() } }),
);

export const [findFilter, useFindFilter] = ServerPublishMany(
  "Courses.findFilter",
  (filter?: FindFilter, limit?: number, skip?: number, sort?: FieldSort[]) =>
    Courses.findFilter({ ...filter, tenants: visibleTenants() }, limit, skip, sort),
);
