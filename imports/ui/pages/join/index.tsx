import React from "react";
import { useTranslation } from "react-i18next";
import { Router } from "meteor/iron:router";
import { useSiteName } from "/imports/utils/getSiteName";

import { JoinLinkEntity } from "/imports/api/joinLinks/joinLinks";
import * as JoinLinksMethods from "/imports/api/joinLinks/methods";
import * as Alert from "/imports/api/alerts/alert";
import * as Users from "/imports/api/users/publications";
import * as Tenants from "/imports/api/tenants/publications";

import { MetaTags } from "/imports/ui/components/MetaTags";
import { useUser } from "/imports/ui/hooks/react-meteor-data";

import { Button } from "../../components/Buttons";

interface Props {
  joinLink: JoinLinkEntity;
}

export function JoinPage({ joinLink }: Props) {
  const { t } = useTranslation();
  const user = useUser();

  const siteName = useSiteName();

  const [isLoadingInviter, inviter] = Users.useDetails(joinLink.createdBy);
  const [isLoadingTenant, tenant] = Tenants.useDetails(joinLink.tenant, joinLink.token);

  const title = t("joinPage.show.siteTitle", "Join {TENANT}", {
    TENANT: tenant?.name,
  });

  async function handleClick() {
    try {
      await JoinLinksMethods.join(joinLink.tenant, joinLink.token);

      Router.go("home");

      Alert.success(
        t("joinPage.join.success", "You joined {NAME}.", {
          NAME: tenant?.name,
        }),
      );
    } catch (err) {
      Alert.serverError(err, t("joinPage.join.error", "Joining didn't work."));
    }
  }

  if (isLoadingInviter() || isLoadingTenant()) {
    return null;
  }

  return (
    <>
      <MetaTags title={title} />

      <div className="container">
        <div className="p-2 p-md-5 bg-light rounded-3">
          <div className="container-fluid py-2 py-md-5">
            <h1 className="display-5">
              {t("joinPage.welcome", "Welcome to {SITENAME}!", {
                SITENAME: siteName,
              })}
            </h1>
            <p className="fs-4">
              {t(
                "joinPage.text",
                "Become part of {TENANT} and propose, discuss, develop, organize and publish groups with {INVITER} and other nice people in {TENANT}.",
                {
                  TENANT: tenant?.name,
                  INVITER: inviter?.getDisplayName(),
                },
              )}
            </p>
            <Button id="join" size="large" needsLogin onClick={handleClick}>
              {!user
                ? t("joinPage.newUser", "Join {TENANT}", { TENANT: tenant?.name })
                : t("joinPage.existingUser", "Join {TENANT} with my user {USER}", {
                    TENANT: tenant?.name,
                    USER: user.getDisplayName(),
                  })}
            </Button>
            <a className="btn btn-lg btn-secondary ms-2" href={Router.path("home")}>
              {t("joinPage.no", "No thanks")}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

// for Blaze

import "./template.html";
Template.registerHelper("JoinPage", () => JoinPage);
