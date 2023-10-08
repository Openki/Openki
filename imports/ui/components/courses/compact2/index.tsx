import React, { useRef } from "react";
import { Router } from "meteor/iron:router";

import { Roles } from "/imports/api/roles/roles";
import { CourseModel } from "/imports/api/courses/courses";

import { hasRole } from "/imports/utils/course-role-utils";

import { InternalIndicator } from "/imports/ui/components/internal-indicator";
import { CourseCategories } from "/imports/ui/components/courses/categories";
import { GroupTag } from "/imports/ui/components/groups/tag";
import { CourseCompactEvent } from "../compact/course-compact-event";
import { CourseCompactRoles } from "../compact/course-compact-roles";

import "./styles.scss";

export function CourseCompact(props: {
  course: CourseModel;
  groupTagEvents: (groupId: string) => {
    onMouseOver: () => Promise<void>;
    onMouseOut: () => Promise<void>;
    onClick: () => Promise<void>;
  };
}) {
  const { course, groupTagEvents } = props;
  const elementRef = useRef<HTMLDivElement>(null);

  function courseCss() {
    if (!course.nextEvent) {
      return {};
    }

    const src = course?.publicImageUrl();
    if (!src) {
      return {};
    }

    return {
      backgroundImage: `linear-gradient(to bottom, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0.75)), url('${src}')`,
      backgroundPosition: "center",
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
    };
  }

  function courseStateClasses() {
    const classes = [];

    if (course.nextEvent) {
      classes.push("has-upcoming-events");
    } else if (course.lastEvent) {
      classes.push("has-past-events");
    } else {
      classes.push("is-proposal");
    }

    if (course.archived) {
      classes.push("is-archived");
    }

    return classes.join(" ");
  }

  function filterPreviewClasses() {
    const classes = [];

    const roles = Roles.map((role) => role.type);

    roles.forEach((role) => {
      const roleDisengaged = !hasRole(course.members, role);
      if (course.roles.includes(role) && roleDisengaged) {
        classes.push(`needs-role-${role}`);
      }
    });

    course.categories?.forEach((category) => {
      classes.push(`category-${category}`);
    });

    course.groups?.forEach((group) => {
      classes.push(`group-${group}`);
    });

    classes.push(`region-${course.region}`);

    return classes.join(" ");
  }

  function groupTagAttr(groupId: string) {
    return {
      groupId,
      isOrganizer: course.groupOrganizers.includes(groupId),
      onClick: async () => {
        await groupTagEvents(groupId).onClick();
      },
      onMouseOver: async () => {
        elementRef.current?.classList.toggle("elevate-child");
        await groupTagEvents(groupId).onMouseOver();
      },
      onMouseOut: async () => {
        elementRef.current?.classList.toggle("elevate-child");
        await groupTagEvents(groupId).onMouseOut();
      },
    };
  }

  return (
    <div className="me-2" style={{ inlineSize: "300px", minInlineSize: "300px" }}>
      <a href={Router.path("showCourse", { _id: course._id, slug: course.slug })}>
        <div
          ref={elementRef}
          className={`row mx-0 align-items-start course-compact ${courseStateClasses()} ${filterPreviewClasses()}`}
          style={courseCss()}
        >
          <div className="course-compact-content col-8">
            {course.internal ? <InternalIndicator /> : null}
            <div className="course-compact-title" title={course.name}>
              {course.name}
            </div>
            <CourseCategories
              categories={course.categories}
              onMouseOver={async () => {
                elementRef.current?.classList.add("elevate-child");
              }}
              onMouseOut={async () => {
                elementRef.current?.classList.remove("elevate-child");
              }}
            />
          </div>
          {course.nextEvent ? (
            <CourseCompactEvent course={course} />
          ) : (
            <CourseCompactRoles course={course} />
          )}

          <div className="tag-group course-groups">
            {course.groups.map((group) => (
              <GroupTag key={group} {...groupTagAttr(group)} />
            ))}
          </div>
        </div>
      </a>
    </div>
  );
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("CourseCompact", () => CourseCompact);
