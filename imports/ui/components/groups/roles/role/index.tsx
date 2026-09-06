import React, { useState } from "react";
import { Router } from "meteor/iron:router";
import { useTranslation } from "react-i18next";
import { useUser } from "/imports/utils/react-meteor-data";
import { useSearchParams } from "/imports/utils/react-meteor-router";

import * as Alert from "/imports/api/alerts/alert";
import { GroupModel, GroupRole } from "/imports/api/groups/groups";
import { unsubscribeFromRole } from "/imports/api/groups/methods";

import { Action } from "/imports/ui/components/PleaseLogin";
import { Enrolling } from "./Enrolling";
import { Subscribed } from "./Subscribed";

import "./styles.scss";

export interface Props {
  group: GroupModel;
  role: GroupRole;
}

export function Role({ group, role }: Props) {
  const { t } = useTranslation();
  const user = useUser();
  const searchParams = useSearchParams();

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
      {searchParams.action === "unsubscribe" &&
        searchParams.role === role.id &&
        searchParams.type === role.type && (
          <Action
            onRender={async () => {
              // unsubscribe by email
              // HACK this is not the right place to act on router actions
              try {
                await unsubscribeFromRole(group._id, { id: role.id, type: role.type });

                Alert.success(
                  t("group.roles.unsubscribed", "Unsubscribed from {GROUP}", {
                    GROUP: group.name,
                  }),
                );
              } catch (err) {
                Alert.serverError(
                  err,
                  t("group.roles.unsubscribed.error", "Failed to unsubscribe"),
                );
              }

              // After unsubscribe got to the event. Equals in route 'showGroup'.
              if (group.singleEvent && group.nextEvent) {
                Router.go("showEvent", group.nextEvent, { replaceState: true });
              }
            }}
          />
        )}

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
