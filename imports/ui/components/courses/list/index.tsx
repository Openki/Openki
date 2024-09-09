import React from "react";

import { CourseCompact } from "/imports/ui/components/courses/compact";
import { CourseModel } from "/imports/api/courses/courses";

export type Props = {
  courses: CourseModel[];
  groupTagEvents?: (groupId: string) => {
    onMouseOver: () => Promise<void>;
    onMouseOut: () => Promise<void>;
    onClick: () => Promise<void>;
  };
  categorieTagEvents: (groupId: string) => {
    onMouseOver: () => Promise<void>;
    onMouseOut: () => Promise<void>;
    onClick: () => Promise<void>;
  };
  small?: boolean;
};

export function CourseList({ courses, groupTagEvents, categorieTagEvents, small }: Props) {
  return (
    <div
      className={`row g-2 row-cols-1 row-cols-sm-2 row-cols-lg-3 ${!small ? "row-cols-xl-4" : ""}`}
    >
      {courses.map((course) => (
        <div key={course._id} className="col">
          <CourseCompact
            course={course}
            groupTagEvents={groupTagEvents}
            categorieTagEvents={categorieTagEvents}
          />
        </div>
      ))}
    </div>
  );
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("CourseList", () => CourseList);
