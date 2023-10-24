import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "/imports/utils/react-meteor-data";

import * as usersMethods from "/imports/api/users/methods";
import * as Alert from "/imports/api/alerts/alert";

import { Avatar } from "../avatar";

import "./styles.scss";

export function AvatarForm() {
  const { t } = useTranslation();
  const user = useUser();
  const [color, setColor] = useState(user?.avatar.color || 0);

  return (
    <div className="avatar-form">
      <Avatar color={color} className="profile-avatar" />

      <div className="mb-3">
        <label className="sr-only" htmlFor="avatarColorRange">
          {t("profile.avatar.inputLabel", "Change hair color")}
        </label>
        <input
          type="range"
          min="0"
          max="360"
          className="avatar-form-input"
          id="avatarColorRange"
          value={color}
          onInput={(event) => {
            const newColor = Number.parseInt(event.currentTarget.value, 10);
            if (newColor === color) {
              return;
            }
            setColor(newColor);
          }}
          onChange={async () => {
            // only update the color if it has changed
            if (user?.avatar?.color === color) {
              return;
            }

            await usersMethods.updateAvatarColor(color);

            Alert.success(t("profile.updated", "Updated profile"));
          }}
        />
      </div>
    </div>
  );
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("AvatarForm", () => AvatarForm);
