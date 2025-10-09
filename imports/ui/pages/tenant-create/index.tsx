import React, { useEffect, useState } from "react";
import { Router } from "meteor/iron:router";

import * as Alert from "/imports/api/alerts/alert";
import { TenantModel } from "/imports/api/tenants/tenants";
import { RegionModel } from "/imports/api/regions/regions";
import * as TenantsMethods from "/imports/api/tenants/methods";
import * as RegionsMethods from "/imports/api/regions/methods";

import * as Analytics from "/imports/ui/lib/analytics";
import * as Metatags from "/imports/utils/metatags";
import { useTranslation } from "react-i18next";

import { Fields } from "../../components/regions/edit/fields";
import { PleaseLogin } from "../../components/please-login";

export interface Data {
  tenant: TenantModel;
  region: RegionModel;
}

template.events({
  submit(event, instance) {
    event.preventDefault();

    const tenantName = instance.$(".js-tenant-name").val() as string;
    if (!tenantName) {
      Alert.error(i18n("tenant.create.plsGiveName", "Please give a organization name"));
      return;
    }

    const name = instance.$(".js-name").val() as string;
    if (!name) {
      Alert.error(i18n("tenant.region.create.plsGiveName", "Please give your region a name"));
      return;
    }

    const loc = instance.locationTracker.getLocation();
    if (!loc) {
      Alert.error(
        i18n(
          "tenant.region.create.plsSelectPointOnMap",
          'Please add a marker on the map by clicking on the "+" sign.',
        ),
      );
      return;
    }

    const changes: Omit<RegionsMethods.CreateFields, "tenant"> = {
      name,
      tz: instance.$(".js-timezone").val() as string,
      loc,
      description: instance.$(".js-description").val() as string,
    };

    instance.busy("saving");
    PleaseLogin(instance, async () => {
      try {
        const tenantId = await TenantsMethods.create({ name: tenantName });
        await RegionsMethods.create({ tenant: tenantId, ...changes });

        Router.go("tenantDetails", { _id: tenantId });

        Alert.success(
          i18n("privateRegion.saving.success", 'Created region "{NAME}".', {
            NAME: changes.name,
          }),
        );

        Analytics.trackEvent("Tenant creations", "Tenant with region creations");
      } catch (err) {
        Alert.serverError(
          err,
          i18n("privateRegion.creating.error", "Creating the region went wrong"),
        );
      } finally {
        instance.busy(false);
      }
    });
  },

  "click .js-edit-cancel"() {
    Router.go("profile");
  },
});

export function TenantCreatePage(data: Data) {
  const { t } = useTranslation();

  const [changes, setChanges] = useState({
    tenantName: data.tenant.name,
    name: data.region.name,
    description: data.region.description,
    tz: data.region.tz,
    loc: data.region.loc,
  });

  useEffect(() => {
    Metatags.setCommonTags(t("tenant.edit.siteTitle.create", "Create private region"));
  });

  return (
    <div className="container mw-md">
      <div className="edit-page region-edit">
        <h2>{t("tenant.create.title", "Create your private region")}</h2>

        <PleaseLogin type="form" onSubmit={handleSave}>
          <div className="mb-3">
            <label className="form-label">
              {t("tenant.edit.name", "Name of your organization:")}
            </label>
            <input
              type="text"
              className="form-control js-tenant-name"
              placeholder={t("tenant.edit.namePlaceholder", "Full name of your organization")}
            />
          </div>
          <Fields
            region={changes}
            onChange={(newChanges) => {
              setChanges(newChanges);
            }}
          />
          <div className="form-actions">
            <ButtonSave onClick={handleSave} />
            <ButtonCancel onClick={() => data.onCancel()} />
          </div>
        </PleaseLogin>
      </div>
    </div>
  );
}
