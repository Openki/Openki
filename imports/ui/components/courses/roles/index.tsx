import React from "react";
import { useDetails } from "/imports/api/courses/publications";
import { useUserId } from "/imports/utils/react-meteor-data";
import { Roles as RolesEntities } from "/imports/api/roles/roles";
import { CourseMemberEntity, CourseModel } from "/imports/api/courses/courses";

import { Role } from "./role";

function loadRoles(course: CourseModel, member?: CourseMemberEntity) {
  return RolesEntities.filter((r) => course.roles?.includes(r.type)).map((r) => ({
    role: r,
    subscribed: course.userHasRole(Meteor.userId(), r.type),
    comment: member?.comment,
    course,
  }));
}

export function Roles({ course: course2 }: { course: CourseModel }) {
  const userId = useUserId();

  // for blaze, can be removed after migration
  // subscribe in react to keep reactivity
  const [isLoading, course] = useDetails(course2._id);
  if (isLoading() || !course) {
    return null;
  }

  const member = course.members?.find((m) => m.user === userId);
  const roles = loadRoles(course, member);

  return (
    <div id="subscribe">
      {roles.map((role) => (
        <Role key={role.role.type} {...role} />
      ))}
    </div>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("CourseRoles", () => Roles);
