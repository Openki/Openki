import React, { useState } from "react";
import { useUser } from "/imports/utils/react-meteor-data";

import { GroupModel, GroupRole } from "/imports/api/groups/groups";

import { Enrolling } from "./Enrolling";
import { Subscribed } from "./Subscribed";

import "./styles.scss";

export interface Props {
  group: GroupModel;
  role: GroupRole;
}

export function Role({ group, role }: Props) {
  const user = useUser();

  const [showFirstSteps, setShowFirstSteps] = useState(false);

  const subscribed = group.userHasRole(user?._id, role);

  function handleAfterSubscribe() {
    setShowFirstSteps(true);
  }

  function handleFirstStepsToggle(toggle: boolean) {
    setShowFirstSteps(toggle);
  }

  return (
    <>
      {!subscribed ? (
        <Enrolling group={group} role={role} afterSubscribe={handleAfterSubscribe} />
      ) : (
        <Subscribed
          role={role}
          group={group}
          showFirstSteps={showFirstSteps}
          onToggle={handleFirstStepsToggle}
        />
      )}
    </>
  );
}
