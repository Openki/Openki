import React from "react";

import { CourseModel } from "/imports/api/courses/courses";
import * as CourseMethods from "/imports/api/courses/methods";
import * as Alert from "/imports/api/alerts/alert";
import { useDetails } from "/imports/api/courses/publications";

import {
  UploadImage,
  Data as EditableImageData,
  EditableImage,
} from "/imports/ui/components/editable-image";
import { useTranslation } from "react-i18next";

export function Files({ course: course2 }: { course: CourseModel }) {
  const { t } = useTranslation();

  // for blaze, can be removed after migration
  // subscribe in react to keep reactivity
  const [isLoading, course] = useDetails(course2._id);

  if (isLoading() || !course) {
    return null;
  }
  function imageUploadArgs(): EditableImageData {
    return {
      thumbnail: { src: course?.publicUrlForCompactImage(), maxSize: 150 },
      maxSize: 1500, // scale the image to max width/height. Note: image scaling also happens on the server
      async onUpload(file: UploadImage) {
        const courseId = course._id;
        try {
          await CourseMethods.updateImage(courseId, file);
          Alert.success(t("course.edit.image.updated", "Image have been saved."));
        } catch (err) {
          Alert.serverError(err, t("course.edit.image.updated.error", "Could not save image."));
        }
      },
      onDelete: course?.image
        ? async function () {
            const courseId = course._id;
            try {
              await CourseMethods.deleteImage(courseId);
              Alert.success(t("course.edit.image.removed", "Image have been removed."));
            } catch (err) {
              Alert.serverError(
                err,
                t("course.edit.image.removed.error", "Could not remove image."),
              );
            }
          }
        : undefined,
    };
  }

  return (
    <>
      <label className="form-label">
        {t("course.edit.files.label", "Files")} (
        {t(
          "course.edit.files.desc",
          "Tip: Take your own photo of an object that is used in or symbolises your topic.",
        )}
        )
      </label>
      <EditableImage {...imageUploadArgs()} />
    </>
  );
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("CourseFiles", () => Files);
