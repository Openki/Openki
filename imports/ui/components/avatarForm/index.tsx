import React, { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { useTranslation } from "react-i18next";
import { useUser } from "/imports/ui/hooks/react-meteor-data";

import * as usersMethods from "/imports/api/users/methods";
import * as Alert from "/imports/api/alerts/alert";

import { Avatar } from "../avatar";

import "./styles.scss";

export function AvatarForm() {
  const { t } = useTranslation();
  const user = useUser();
  const [color, setColor] = useState(user?.avatar.color || 0);

  const handleChange = useDebouncedCallback(async function (newValue: number) {
    await usersMethods.updateAvatarColor(newValue);
    Alert.success(t("profile.updated", "Updated profile"));
  }, 500);

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
          onInput={async (event) => {
            const newColor = event.currentTarget.valueAsNumber;
            setColor(newColor);
            await handleChange(newColor);
          }}
        />
      </div>
    </div>
  );
}
