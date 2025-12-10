import React from "react";
import { difference } from "lodash-es";
import { Router } from "meteor/iron:router";
import { useTranslation } from "react-i18next";
import { useUser } from "/imports/utils/react-meteor-data";

import * as Alert from "/imports/api/alerts/alert";
import { CourseModel } from "/imports/api/courses/courses";
import { useDetails } from "../../../../../api/organizations/publications";
import * as CoursesMethods from "/imports/api/courses/methods";

import { name } from "../../../../lib/organization-name-helpers";

function OrganizationToAdd({
  course,
  organizationId,
}: {
  course: CourseModel;
  organizationId: string;
}) {
  const { t } = useTranslation();
  const [isLoading, organization] = useDetails(organizationId);

  if (isLoading()) {
    return null;
  }

  return (
    <li>
      <button
        className="btn btn-link"
        type="button"
        value={organizationId}
        onClick={async () => {
          try {
            await CoursesMethods.promote(course._id, organizationId, true);

            Alert.success(
              t("courseGroupAdd.groupAdded", "{GROUP} was added to promote {COURSE}.", {
                GROUP: name(organization),
                COURSE: course.name,
              }),
            );
          } catch (err) {
            Alert.serverError(err, t("courseGroupAdd.groupAdded.error", "Adding failed"));
          }
        }}
      >
        {name(organization)}
      </button>
    </li>
  );
}

export interface Props {
  course: CourseModel;
}

export function Add({ course }: Props) {
  const { t } = useTranslation();
  const user = useUser();

  const organizationsToAdd = user && difference(user.groups, course.groups);

  if (!organizationsToAdd) {
    return null;
  }

  return (
    <div className="btn-group tag-btn group-tag-btn align-top">
      <button
        type="button"
        className="dropdown-toggle"
        aria-expanded="false"
        aria-haspopup="true"
        data-bs-toggle="dropdown"
      >
        <i className="fa-solid fa-plus fa-fw" />
        <span>{t("course.group.addText", "link a group")}</span>
      </button>
      <ul className="dropdown-menu dialog-dropdown">
        <li className="dropdown-header">
          {t("grouplist.addgroups.header", "Add group")}
          <button type="button" className="btn-close"></button>
        </li>
        <li>
          <hr className="dropdown-divider" />
        </li>
        {organizationsToAdd.map((organizationId) => (
          <OrganizationToAdd key={organizationId} course={course} organizationId={organizationId} />
        ))}
        <li className="dialog-dropdown-btn">
          <a href={Router.path("groupDetails", { _id: "create" })} className="btn btn-success">
            {t("profile.createNewGroup.button")}
          </a>
        </li>
      </ul>
    </div>
  );
}
