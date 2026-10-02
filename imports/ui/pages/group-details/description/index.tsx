import React from "react";
import { GroupModel } from "/imports/api/groups/groups";
import { useUser } from "/imports/ui/hooks/react-meteor-data";
import { PublicSettings } from "/imports/utils/PublicSettings";
import { useTranslation } from "react-i18next";

import * as Alert from "/imports/api/alerts/alert";
import * as GroupsMethods from "/imports/api/groups/methods";

import { Editable, Props as EditableProps } from "/imports/ui/components/editable";

import "./styles.scss";

export function Description({
  group,
  onStartEditing,
}: {
  group: GroupModel;
  onStartEditing?: () => void;
}) {
  const { t } = useTranslation();
  const user = useUser();

  const editableDescription: EditableProps = {
    text: group.description,
    multiline: true,
    placeholder: t("group.description.placeholder"),
    maxlength: PublicSettings.groupDescriptionMax,
    store: {
      onSave: async (newDescription) => {
        await GroupsMethods.save(group._id, { description: newDescription });
      },
      onSuccess: () => {
        Alert.success(
          t(
            "groupDetails.message.descriptionChanged",
            "The description of {NAME} has been changed.",
            { NAME: group.name },
          ),
        );
      },
      onError: (err) => {
        Alert.serverError(err as string | Error, t("group.save.error"));
      },
    },
  };

  return (
    <div className="group-details-description" id="group-description">
      {group?.editableBy(user) ? (
        <Editable {...editableDescription} onStartEditing={onStartEditing} />
      ) : (
        <p dangerouslySetInnerHTML={{ __html: group.description || "" }}></p>
      )}
    </div>
  );
}
