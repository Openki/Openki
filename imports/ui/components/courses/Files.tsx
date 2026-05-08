import React from "react";
import { useTranslation } from "react-i18next";

import { CourseModel } from "/imports/api/courses/courses";
import * as CourseMethods from "/imports/api/courses/methods";
import * as Alert from "/imports/api/alerts/alert";

import {
  UploadImage,
  Data as EditableImageData,
  EditableImage,
} from "/imports/ui/components/editable-image";

export function Files({ course }: { course: CourseModel }) {
  const { t } = useTranslation();

  function imageUploadArgs(): EditableImageData {
    return {
      fullImage: { src: course.publicUrlForDetailsImage(), maxSize: 1500 },
      thumbnail: { src: course.publicUrlForCompactImage(), maxSize: 150 },
      maxSize: 5000, // scale the image to max width/height. Note: image scaling also happens on the server
      async onUpload(file: UploadImage) {
        try {
          await CourseMethods.updateImage(course._id, file);
          Alert.success(t("course.edit.image.updated", "Image have been saved."));
        } catch (err) {
          Alert.serverError(err, t("course.edit.image.updated.error", "Could not save image."));
        }
      },
      onDelete: course.image
        ? async function () {
            try {
              await CourseMethods.deleteImage(course._id);
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
