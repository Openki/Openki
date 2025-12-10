import React from "react";
import { PublicSettings } from "/imports/utils/PublicSettings";

import { CourseCompact } from "/imports/ui/components/courses/compact";
import { CompactPropose } from "/imports/ui/components/courses/CompactPropose";
import { CourseModel } from "/imports/api/courses/courses";

export interface Props {
  courses: CourseModel[];
  organizationTagEvents?:
    | ((organizationId: string) => {
        onMouseOver: () => Promise<void>;
        onMouseOut: () => Promise<void>;
        onClick: () => Promise<void>;
      })
    | undefined;
  categorieTagEvents?:
    | ((organizationId: string) => {
        onMouseOver: () => Promise<void>;
        onMouseOut: () => Promise<void>;
        onClick: () => Promise<void>;
      })
    | undefined;
  small?: boolean;
  containsPropose?: boolean;
  /** that should be added on propose a new course */
  organization?: string | undefined;
}

export function CourseList({
  courses,
  organizationTagEvents,
  categorieTagEvents,
  small,
  containsPropose,
  organization,
}: Props) {
  return (
    <div
      className={`row g-2 row-cols-1 row-cols-sm-2 row-cols-lg-3 ${!small ? "row-cols-xl-4" : ""}`}
    >
      {courses.map((course, index) => (
        <React.Fragment key={course._id}>
          {/* The sevent box should allways be the propose one, after then every 11 */}
          {PublicSettings.feature.proposeCourseBox &&
            !!containsPropose &&
            (index - 6) % 10 === 0 && (
              <div className="col">
                <CompactPropose
                  organization={organization}
                  organizationTagEvents={organizationTagEvents}
                />
              </div>
            )}
          <div className="col">
            <CourseCompact
              course={course}
              organizationTagEvents={organizationTagEvents}
              categorieTagEvents={categorieTagEvents}
            />
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
