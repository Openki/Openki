import React from "react";
import { useTranslation } from "react-i18next";

import { GroupModel } from "/imports/api/groups/groups";
import * as GroupMethods from "/imports/api/groups/methods";
import * as Alert from "/imports/api/alerts/alert";

import {
  UploadImage,
  Props as EditableImageProps,
  EditableImage,
} from "/imports/ui/components/editable-image";

export function Files({ group }: { group: GroupModel }) {
  const { t } = useTranslation();

  function imageUploadArgs(): EditableImageProps {
    return {
      fullImage: { src: group.publicUrlForDetailsImage(), maxSize: 1500 },
      thumbnail: { src: group.publicUrlForCompactImage(), maxSize: 150 },
      maxSize: 5000, // scale the image to max width/height. Note: image scaling also happens on the server
      async onUpload(file: UploadImage) {
        try {
          await GroupMethods.updateImage(group._id, file);
          Alert.success(t("group.edit.image.updated", "Image have been saved."));
        } catch (err) {
          Alert.serverError(err, t("group.edit.image.updated.error", "Could not save image."));
        }
      },
      onDelete: group.image
        ? async function () {
            try {
              await GroupMethods.deleteImage(group._id);
              Alert.success(t("group.edit.image.removed", "Image have been removed."));
            } catch (err) {
              Alert.serverError(
                err,
                t("group.edit.image.removed.error", "Could not remove image."),
              );
            }
          }
        : undefined,
    };
  }

  return (
    <>
      <label className="form-label">
        {t("group.edit.files.label", "Files")} (
        {t(
          "group.edit.files.desc",
          "Tip: Take your own photo of an object that is used in or symbolises your topic.",
        )}
        )
      </label>
      <EditableImage {...imageUploadArgs()} />
    </>
  );
}
