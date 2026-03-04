import React from "react";
import { useUser } from "/imports/utils/react-meteor-data";
import { useTranslation } from "react-i18next";

import * as Alert from "/imports/api/alerts/alert";
import * as CoursesMethods from "/imports/api/courses/methods";
import { CourseModel } from "/imports/api/courses/courses";

import { Editable, Props as EditableProps } from "/imports/ui/components/editable";
import { InternalIndicator } from "/imports/ui/components/internal-indicator";
import { SingleEventIndicator } from "/imports/ui/components/single-event-indicator";
import { Tag } from "/imports/ui/components/regions/tag";
import { CourseCategories } from "/imports/ui/components/courses/categories";
import { OrganizationList } from "../../../components/courses/display/organization-list";

import "./styles.scss";

export function Header({ course }: { course: CourseModel }) {
  const { t } = useTranslation();

  const user = useUser();

  const editableNameAttr: EditableProps = {
    text: course.name,
    multiline: false,
    placeholder: t("course.title.placeholder"),
    store: {
      onSave: async (newName) => {
        await CoursesMethods.save(course._id, { name: newName });
      },
      onSuccess: (newName) => {
        Alert.success(
          t("courseDetails.message.nameChanged", 'The name has been changed to "{NAME}".', {
            NAME: newName,
          }),
        );
      },
      onError: (err) => {
        Alert.serverError(err as string | Error, t("course.save.error", "Saving went wrong"));
      },
    },
  };

  function detailsHeaderAttr() {
    const src = course?.publicUrlForDetailsImage();
    if (!src) {
      return {};
    }

    return {
      style: {
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.75)), url('${src}')`,
        backgroundPosition: "center",
        backgroundSize: "cover",
      },
    };
  }

  function isProposal() {
    return !course?.nextEvent && !course?.lastEvent;
  }

  return (
    <div className="details-header" {...detailsHeaderAttr()}>
      {course.internal && <InternalIndicator />}
      {course.singleEvent && <SingleEventIndicator />}
      <div className="details-header-tags">
        {isProposal() && (
          <div className="proposal-tag">
            <i className="fa-regular fa-lightbulb fa-fw" />
            {t("course.details.is-proposalTag", "Proposal")}
          </div>
        )}
        <Tag region={course.region} />
      </div>
      <div className="course-details-title">
        {course?.editableBy(user) ? <Editable {...editableNameAttr} /> : <h2>{course.name}</h2>}
      </div>
      {!!course.categories && (
        <div className="course-details-categories">
          <CourseCategories categories={course.categories} />
        </div>
      )}
      <OrganizationList course={course} />
    </div>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("CourseDetailsHeader", () => Header);
