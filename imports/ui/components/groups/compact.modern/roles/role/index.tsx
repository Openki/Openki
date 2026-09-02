import React, { useState } from "react";
import { useUser } from "/imports/utils/react-meteor-data";

import { GroupModel } from "/imports/api/groups/groups";

import { RoleEntity } from "/imports/utils/PublicSettings";

import { Enrolling } from "./Enrolling";
import { Subscribed } from "./Subscribed";

import "./styles.scss";

export interface Props {
  group: GroupModel;
  roleId: RoleEntity["id"];
}

export function Role({ group, roleId }: Props) {
  const user = useUser();

  const [showFirstSteps, setShowFirstSteps] = useState(false);

  const subscribed = group.userHasRole(user?._id, roleId);

  function handleAfterSubscribe() {
    setShowFirstSteps(true);
  }

  function handleFirstStepsToggle(toggle: boolean) {
    setShowFirstSteps(toggle);
  }

  return (
    <>
      {!subscribed ? (
        <Enrolling group={group} roleId={roleId} afterSubscribe={handleAfterSubscribe} />
      ) : (
        <Subscribed
          roleId={roleId}
          group={group}
          showFirstSteps={showFirstSteps}
          onToggle={handleFirstStepsToggle}
        />
      )}
    </>
  );
}
