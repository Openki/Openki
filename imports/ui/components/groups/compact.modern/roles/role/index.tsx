import React, { useState } from "react";
import { useUser } from "/imports/utils/react-meteor-data";

import { GroupModel } from "/imports/api/groups/groups";

import { RoleEntity } from "/imports/utils/PublicSettings";

import { Enrolling } from "./Enrolling";
import { Subscribed } from "./Subscribed";

import "./styles.scss";

export interface Props {
  group: GroupModel;
  roleType: RoleEntity["type"];
}

export function Role({ group, roleType }: Props) {
  const user = useUser();

  const [showFirstSteps, setShowFirstSteps] = useState(false);

  const subscribed = group.userHasRole(user?._id, roleType);

  function handleAfterSubscribe() {
    setShowFirstSteps(true);
  }

  function handleFirstStepsToggle(toggle: boolean) {
    setShowFirstSteps(toggle);
  }

  return (
    <>
      {!subscribed ? (
        <Enrolling group={group} roleType={roleType} afterSubscribe={handleAfterSubscribe} />
      ) : (
        <Subscribed
          roleType={roleType}
          group={group}
          showFirstSteps={showFirstSteps}
          onToggle={handleFirstStepsToggle}
        />
      )}
    </>
  );
}
