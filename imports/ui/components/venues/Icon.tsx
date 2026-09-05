import React from "react";
import { useUser } from "/imports/utils/react-meteor-data";
import { cx } from "/imports/utils/cx";

export function Icon({
  id,
  restrictedUse,
}: {
  id?: string | undefined;
  restrictedUse?: boolean | undefined;
}) {
  const user = useUser();

  function icon() {
    if (id && user?.venues.includes(id)) {
      return "fa-house-user";
    }

    if (restrictedUse) {
      return "fa-house-lock";
    }

    return "fa-house";
  }

  return <i className={cx("fa-fw fa-solid", icon())} />;
}
