import React from "react";
import { Router } from "meteor/iron:router";

import * as Alert from "/imports/api/alerts/alert";
import { InvitationEntity } from "/imports/api/invitations/invitations";
import * as InvitationsMethods from "/imports/api/invitations/methods";
import { TenantModel } from "/imports/api/tenants/tenants";

import { MetaTags } from "/imports/ui/components/MetaTags";
import { useTranslation } from "react-i18next";
import { useTracker } from "meteor/react-meteor-data";
import { getUserName } from "../../lib/getUserName";
import { useSiteName } from "/imports/utils/getSiteName";
import { useUser } from "meteor/react-meteor-accounts";
import { Button } from "/imports/ui/components/Buttons";

export function InvitationPage({
  tenant,
  invitation,
}: {
  tenant: TenantModel;
  invitation: InvitationEntity;
}) {
  const { t } = useTranslation();

  const user = useUser();
  const siteName = useSiteName();
  const userName = useTracker(() => getUserName(invitation.createdBy));

  async function handleClick() {
    try {
      await InvitationsMethods.join(invitation.tenant, invitation.token);

      Router.go("home");

      Alert.success(
        t("invitation.join.success", 'You joined "{NAME}".', {
          NAME: tenant.name,
        }),
      );
    } catch (err) {
      Alert.serverError(err, t("invitation.join.error", "Join not worked."));
    }
  }

  const title = t("invitation.show.siteTitle", "Join {TENANT}", {
    TENANT: tenant.name,
  });

  return (
    <>
      <MetaTags title={title} />

      <div className="container">
        <div className="p-2 p-md-5 bg-light rounded-3">
          <div className="container-fluid py-2 py-md-5">
            <h1 className="display-5">
              {t("invitation.join.welcome", "Welcome to {SITENAME}!", { SITENAME: siteName })}
            </h1>
            <p className="fs-4">
              {t(
                "invitation.join.text",
                "Become part of {TENANT} and propose, discuss, develop, organize and publish groups with {INVITER} and other nice people in {TENANT}.",
                { TENANT: tenant.name, INVITER: userName },
              )}
            </p>
            <Button
              id="invitation-save"
              needsLogin
              size="large"
              onClick={handleClick}
              className="btn-save"
            >
              {!user
                ? t("invitation.join.newUser", "Join {TENANT}", { TENANT: tenant.name })
                : t("invitation.join.existingUser", "Join {TENANT} with user {USER}", {
                    TENANT: tenant.name,
                    USER: user.getDisplayName(),
                  })}
            </Button>{" "}
            <a className="btn btn-lg btn-secondary" href={Router.path("home")}>
              {t("invitation.join.no", "No thanks")}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("InvitationPage", () => InvitationPage);
