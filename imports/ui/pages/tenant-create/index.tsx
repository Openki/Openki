import React, { useEffect, useState } from "react";
import { Router } from "meteor/iron:router";
import omit from "lodash/omit";

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
import { ButtonCancel, ButtonSubmit } from "../../components/buttons";

export interface Data {
  tenant: TenantModel;
  region: RegionModel;
}

export function TenantCreatePage(data: Data) {
  const { t } = useTranslation();

  const [isBusy, setIsBusy] = useState(false);
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

  async function handleSave() {
    if (!changes.tenantName) {
      Alert.error(t("tenant.create.plsGiveName", "Please give a organization name"));
      return;
    }

    if (!changes.name) {
      Alert.error(t("tenant.region.create.plsGiveName", "Please give your region a name"));
      return;
    }

    if (!changes.loc) {
      Alert.error(
        t(
          "tenant.region.create.plsSelectPointOnMap",
          'Please add a marker on the map by clicking on the "+" sign.',
        ),
      );
      return;
    }

    setIsBusy(true);
    try {
      const tenantId = await TenantsMethods.create({ name: changes.tenantName });
      await RegionsMethods.create({ tenant: tenantId, ...(omit(changes, "tenantName") as any) });

      Router.go("tenantDetails", { _id: tenantId });

      Alert.success(
        t("privateRegion.saving.success", 'Created region "{NAME}".', {
          NAME: changes.name,
        }),
      );

      Analytics.trackEvent("Tenant creations", "Tenant with region creations");
    } catch (err) {
      Alert.serverError(err, t("privateRegion.creating.error", "Creating the region went wrong"));
    } finally {
      setIsBusy(false);
    }
  }

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
              data-test="tenant-edit-name"
              type="text"
              className="form-control"
              placeholder={t("tenant.edit.namePlaceholder", "Full name of your organization")}
              onChange={(event) => {
                setChanges({
                  ...changes,
                  tenantName: event.currentTarget.value,
                });
              }}
            />
          </div>
          <Fields
            region={changes}
            onChange={(newChanges) => {
              setChanges((changes) => {
                return {
                  tenantName: changes.tenantName,
                  ...newChanges,
                };
              });
            }}
          />
          <div className="form-actions">
            <ButtonSubmit isBusy={isBusy} />
            <ButtonCancel
              disabled={isBusy}
              onClick={() => {
                Router.go("profile");
              }}
            />
          </div>
        </PleaseLogin>
      </div>
    </div>
  );
}

// for Blaze
import "./template.html";

Template.registerHelper("TenantCreatePage", () => TenantCreatePage);
