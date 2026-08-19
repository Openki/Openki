import React, { useState } from "react";
import { Router } from "meteor/iron:router";
import { useTranslation } from "react-i18next";
import { useUser } from "/imports/utils/react-meteor-data";
import { useSearchParams } from "/imports/utils/react-meteor-router";

import * as Alert from "/imports/api/alerts/alert";
import { Unsubscribe, processChange } from "/imports/api/groups/subscription";
import { GroupModel } from "/imports/api/groups/groups";

import { RoleEntity } from "/imports/utils/PublicSettings";

import { Action } from "/imports/ui/components/PleaseLogin";
import { Enrolling } from "/imports/ui/components/groups/roles/role/Enrolling";
import { Subscribed } from "/imports/ui/components/groups/roles/role/Subscribed";

import "./styles.scss";

export interface Props {
  group: GroupModel;
  roleType: RoleEntity["type"];
}

export function Role({ group, roleType }: Props) {
  const { t } = useTranslation();
  const user = useUser();
  const searchParams = useSearchParams();

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
      {searchParams.unsubscribe === roleType && (
        <Action
          onRender={async () => {
            // unsubscribe by email
            // HACK this is not the right place to act on router actions
            const change = new Unsubscribe(group, user?._id, roleType);
            if (change.validFor(user)) {
              await processChange(change);
              Alert.success(
                t("group.roles.unsubscribed", "Unsubscribed from {GROUP}", {
                  GROUP: group.name,
                }),
              );
            } else {
              Alert.error(`${change} not valid for ${user}`);
            }

            // After unsubscribe got to the event. Equals in route 'showGroup'.
            if (group.singleEvent && group.nextEvent) {
              Router.go("showEvent", group.nextEvent, { replaceState: true });
            }
          }}
        />
      )}

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
