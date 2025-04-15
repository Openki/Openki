import React from "react";
import { CourseModel } from "/imports/api/courses/courses";
import { useUser } from "/imports/utils/react-meteor-data";
import { PublicSettings } from "/imports/utils/PublicSettings";
import { useTranslation } from "react-i18next";

import * as Alert from "/imports/api/alerts/alert";
import * as CoursesMethods from "/imports/api/courses/methods";

import { Editable, Props as EditableProps } from "/imports/ui/components/editable/index.react";

import "./styles.scss";

export function Description({ course }: { course: CourseModel }) {
  const { t } = useTranslation();
  const user = useUser();

  const editableDescription: EditableProps = {
    text: course.description,
    multiline: true,
    placeholder: t("course.description.placeholder"),
    maxlength: PublicSettings.courseDescriptionMax,
    store: {
      onSave: async (newDescription) => {
        await CoursesMethods.save(course._id, { description: newDescription });
      },
      onSuccess: () => {
        Alert.success(
          t(
            "courseDetails.message.descriptionChanged",
            "The description of {NAME} has been changed.",
            { NAME: course.name },
          ),
        );
      },
      onError: (err) => {
        Alert.serverError(err as string | Error, t("course.save.error"));
      },
    },
  };

  return (
    <div className="course-details-description" id="course-description">
      {course?.editableBy(user) ? (
        <Editable {...editableDescription} />
      ) : (
        <p dangerouslySetInnerHTML={{ __html: course.description || "" }}></p>
      )}
    </div>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("CourseDetailsDescription", () => Description);
