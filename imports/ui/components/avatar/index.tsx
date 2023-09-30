import React from "react";

import { PublicSettings } from "/imports/utils/PublicSettings";

import * as Users from "/imports/api/users/publications";

import "./styles.scss";
import { useUserId } from "/imports/utils/react-meteor-data";
import { getLocalizedValue } from "/imports/utils/getLocalizedValue";

export function Avatar(data: { color?: number; userId?: string; class?: string }) {
  const currenctUserId = useUserId();

  const userId = data.userId || currenctUserId;

  if (!userId) {
    throw new Error("Unexpected falsy: userId");
  }

  const [isLoading, user] = Users.useDetails(userId);

  function color() {
    // the form sets the color directly
    if (data.color !== undefined) {
      return data.color;
    }

    // otherwise get the color from a user
    return user?.avatar?.color || 0;
  }

  if (isLoading()) {
    <img
      className={`avatar-image ${data.class} placeholder-rainbow`}
      src={`/logo/${PublicSettings.avatarLogo.src}`}
      alt={getLocalizedValue(PublicSettings.avatarLogo.alt)}
    />;
  }

  return (
    <img
      className={`avatar-image ${data.class}`}
      style={{ filter: `hue-rotate(-${color()}deg)` }}
      src={`/logo/${PublicSettings.avatarLogo.src}`}
      alt={getLocalizedValue(PublicSettings.avatarLogo.alt)}
    />
  );
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("Avatar", () => Avatar);
