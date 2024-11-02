import React from "react";
import { RoleEntity } from "/imports/api/roles/roles";
import { CourseModel } from "/imports/api/courses/courses";

import { Role } from "./role";

export function Roles({
  roles,
}: {
  roles: {
    role: RoleEntity;
    subscribed: boolean;
    comment: string | undefined;
    course: CourseModel;
  }[];
}) {
  return (
    <div id="subscribe">
      {roles.map((role) => (
        <Role key={role.role.type} {...role} />
      ))}
    </div>
  );
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("CourseRoles", () => Roles);
