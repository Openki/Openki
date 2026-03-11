import React, { useRef } from "react";
import { Router } from "meteor/iron:router";
import { useUser } from "/imports/utils/react-meteor-data";

import { Roles } from "/imports/api/roles/roles";
import { CourseModel } from "/imports/api/courses/courses";
import { useDetails as useRegionDetails } from "/imports/api/regions/publications";

import { hasRole } from "/imports/utils/course-role-utils";

import { InternalIndicator } from "/imports/ui/components/internal-indicator";
import { SingleEventIndicator } from "/imports/ui/components/single-event-indicator";
import { CourseCategories } from "/imports/ui/components/courses/categories";
import { OrganizationTag } from "../../organizations/tag";
import { CourseCompactEvent } from "./course-compact-event";
import { CourseCompactRoles } from "./course-compact-roles";

import "./styles.scss";

export interface Props {
  course: CourseModel;
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
}

export function CourseCompact({ course, organizationTagEvents, categorieTagEvents }: Props) {
  const elementRef = useRef<HTMLDivElement>(null);
  const user = useUser();

  const [isRegionLoading, region] = useRegionDetails(course?.region);

  function courseCss() {
    if (!course.nextEvent) {
      return {};
    }

    const src = course?.publicUrlForCompactImage();
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

    course.groups?.forEach((organization) => {
      classes.push(`group-${organization}`);
    });

    classes.push(`region-${course.region}`);

    return classes.join(" ");
  }

  function organizationTagAttr(organizationId: string) {
    return {
      organizationId,
      isOrganizer: course.groupOrganizers.includes(organizationId),
      onClick: async () => {
        await organizationTagEvents?.(organizationId).onClick();
      },
      onMouseOver: async () => {
        elementRef.current?.classList.add("elevate-child");
        await organizationTagEvents?.(organizationId).onMouseOver();
      },
      onMouseOut: async () => {
        elementRef.current?.classList.remove("elevate-child");
        await organizationTagEvents?.(organizationId).onMouseOut();
      },
    };
  }

  const organizations = course.groups.filter(
    (organizationId) =>
      !(
        // hide organization where are from the region set
        (
          region?.defaultTeamOrganizations?.includes(organizationId) &&
          // when user ist not member of the organization or a admin
          !user?.mayPromoteWith(organizationId) &&
          !course.editableBy(user)
        )
      ),
  );

  return (
    <div
      ref={elementRef}
      className={`row mx-0 align-items-start course-compact ${courseStateClasses()} ${filterPreviewClasses()}`}
      style={courseCss()}
    >
      <div className="course-compact-content col-8">
        {course.internal && <InternalIndicator />}
        {course.singleEvent && <SingleEventIndicator />}
        <div className="course-compact-title" title={course.name}>
          <a className="stretched-link" href={Router.path("showCourse", course)}>
            {course.name}
          </a>
        </div>
        <CourseCategories
          categories={course.categories}
          onClick={async (categorie) => {
            categorieTagEvents?.(categorie).onClick();
          }}
          onMouseOver={async (categorie) => {
            elementRef.current?.classList.add("elevate-child");
            categorieTagEvents?.(categorie).onMouseOver();
          }}
          onMouseOut={async (categorie) => {
            elementRef.current?.classList.remove("elevate-child");
            categorieTagEvents?.(categorie).onMouseOut();
          }}
        />
      </div>
      {course.nextEvent ? (
        <CourseCompactEvent event={course.nextEvent} />
      ) : (
        <CourseCompactRoles course={course} />
      )}
      {!isRegionLoading() && (
        <div className="tag-group course-groups">
          {organizations.map((organization) => (
            <OrganizationTag key={organization} {...organizationTagAttr(organization)} />
          ))}
        </div>
      )}
    </div>
  );
}
