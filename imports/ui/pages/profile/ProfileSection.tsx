import { Router } from "meteor/iron:router";
import React from "react";
import { useTranslation } from "react-i18next";
import { AvatarForm } from "../../components/avatarForm";
import { Props as EditableProps, Editable } from "/imports/ui/components/editable";
import * as Alert from "/imports/api/alerts/alert";
import * as usersMethods from "/imports/api/users/methods";
import { NotAllowedCharacters } from "/imports/startup/both/NotAllowedCharacter";
import { useUser } from "/imports/utils/react-meteor-data";

export function ProfileSection() {
  const { t } = useTranslation();
  const user = useUser();

  if (!user) {
    return null;
  }

  const editableNameAttr: EditableProps = {
    text: user.username,
    multiline: false,
    placeholder: t("profile.name.placeholder", "Username"),

    store: {
      serverValidationErrors: [
        {
          type: "noUserName",
          message: () => t("warning.noUserName", "Please enter a name for your user."),
        },
        {
          type: "notAllowedCharacter",
          message: () =>
            t("register.warning.notAllowedCharacter", {
              CHARACTERS: NotAllowedCharacters.join(", "),
            }),
        },
        {
          type: "userExists",
          message: () =>
            t("warning.userExists", "This username is already in use. Please choose another one."),
        },
        {
          type: "nameError",
          message: () => t("update.username.failed", "Could not update username."),
        },
      ],
      onSave: async (newName) => {
        await usersMethods.updateUsername(newName || "");
      },
      onSuccess: () => {
        Alert.success(t("profile.updated", "Updated profile"));
      },
    },
  };
  const editableDescriptionAttr: EditableProps = {
    text: user.description,
    multiline: true,
    placeholder: t(
      "profile.description.placeholder",
      "About you. Let the community know what your interests are.",
    ),
    store: {
      onSave: async (newDescription) => {
        await usersMethods.updateDescription(newDescription || "");
      },
      onSuccess: () => {
        Alert.success(t("profile.updated", "Updated profile"));
      },
    },
  };

  return (
    <div className="page-component">
      <div className="row g-3">
        <div className="col-6 col-sm-3">
          <AvatarForm />
        </div>

        <div className="col-sm-9">
          <h2 className="mt-4">
            <Editable {...editableNameAttr} />
          </h2>
          <div className="mb-3">
            <Editable {...editableDescriptionAttr} />
          </div>
          <a className="btn btn-primary" href={Router.path("userprofile", user)}>
            <i className="fa-solid fa-user fa-fw" /> {t("login.frame.profile", "Public profile")}
          </a>
        </div>
      </div>
    </div>
  );
}
