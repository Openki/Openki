import React from "react";
import { useUserId } from "/imports/utils/react-meteor-data";
import { useLocalizedSetting } from "/imports/utils/getLocalizedValue";

import { PublicSettings } from "/imports/utils/PublicSettings";

import * as Users from "/imports/api/users/publications";

import "./styles.scss";

function Anom({ className }: { className?: string | undefined }) {
  const { getLocalizedValue } = useLocalizedSetting();

  return (
    <img
      className={`avatar-image ${className} placeholder-rainbow`}
      src={`/logo/${PublicSettings.avatarLogo.src}`}
      alt={getLocalizedValue(PublicSettings.avatarLogo.alt)}
    />
  );
}

function UserAvatar(props: {
  color?: number | undefined;
  userId: string;
  className?: string | undefined;
}) {
  const { getLocalizedValue } = useLocalizedSetting();
  const [isLoading, user] = Users.useDetails(props.userId);

  function color() {
    // the form sets the color directly
    if (props.color !== undefined) {
      return props.color;
    }

    // otherwise get the color from a user
    return user?.avatar?.color || 0;
  }

  if (isLoading() || color() === 0) {
    return <Anom className={props.className} />;
  }

  return (
    <img
      className={`avatar-image ${props.className}`}
      style={{ filter: `hue-rotate(-${color()}deg)` }}
      src={`/logo/${PublicSettings.avatarLogo.src}`}
      alt={getLocalizedValue(PublicSettings.avatarLogo.alt)}
    />
  );
}

export interface Props { color?: number; userId?: string; className?: string }

export function Avatar(props: Props) {
  const currenctUserId = useUserId();

  const userId = props.userId || currenctUserId;

  if (!userId) {
    return <Anom className={props.className} />;
  }

  return <UserAvatar color={props.color} userId={userId} className={props.className} />;
}

// for Blaze
import "./template.html";

Template.registerHelper("Avatar", () => Avatar);
