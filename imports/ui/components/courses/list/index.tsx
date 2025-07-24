import React from "react";
import { PublicSettings } from "/imports/utils/PublicSettings";

import { CourseCompact } from "/imports/ui/components/courses/compact";
import { CompactPropose } from "/imports/ui/components/courses/compact-propose";
import { CourseModel } from "/imports/api/courses/courses";

export interface Props {
  courses: CourseModel[];
  groupTagEvents?:
    | ((groupId: string) => {
        onMouseOver: () => Promise<void>;
        onMouseOut: () => Promise<void>;
        onClick: () => Promise<void>;
      })
    | undefined;
  categorieTagEvents?:
    | ((groupId: string) => {
        onMouseOver: () => Promise<void>;
        onMouseOut: () => Promise<void>;
        onClick: () => Promise<void>;
      })
    | undefined;
  small?: boolean;
  containsPropose?: boolean;
  /** that should be added on propose a new course */
  group?: string | undefined;
}

export function CourseList({
  courses,
  groupTagEvents,
  categorieTagEvents,
  small,
  containsPropose,
  group,
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
                <CompactPropose group={group} groupTagEvents={groupTagEvents} />
              </div>
            )}
          <div className="col">
            <CourseCompact
              course={course}
              groupTagEvents={groupTagEvents}
              categorieTagEvents={categorieTagEvents}
            />
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("CourseList", () => CourseList);
