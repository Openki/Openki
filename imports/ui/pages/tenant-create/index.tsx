import React, { useState } from "react";
import { Router } from "meteor/iron:router";
import { omit } from "lodash-es";
import * as Analytics from "/imports/ui/lib/analytics";
import { MetaTags } from "/imports/ui/components/MetaTags";
import { useTranslation } from "react-i18next";
import { useAccountTasks } from "/imports/utils/useAccountTasks";

import * as Alert from "/imports/api/alerts/alert";
import { TenantModel } from "/imports/api/tenants/tenants";
import { RegionModel } from "/imports/api/regions/regions";
import * as TenantsMethods from "/imports/api/tenants/methods";
import * as RegionsMethods from "/imports/api/regions/methods";

import { Fields } from "../../components/regions/edit/Fields";
import { ButtonCancel, ButtonSave } from "/imports/ui/components/Buttons";
import { FormControl } from "/imports/ui/components/form-control";

export interface Data {
  tenant: TenantModel;
  region: RegionModel;
}

export function TenantCreatePage(data: Data) {
  const { t } = useTranslation();

  const [changes, setChanges] = useState({
    tenantName: data.tenant.name,
    name: data.region.name,
    description: data.region.description,
    tz: data.region.tz,
    loc: data.region.loc,
  });

  const { promptToLogin } = useAccountTasks();
  const [isBusy, setIsBusy] = useState(false);

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!changes.tenantName) {
      Alert.error(t("tenant.create.plsGiveName", "Please give a name"));
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
      if (!(await promptToLogin())) {
        return;
      }

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
    <>
      <MetaTags title={t("tenant.edit.siteTitle.create", "Create private region")} />

      <div className="container mw-md">
        <div className="edit-page region-edit">
          <h2>{t("tenant.create.title", "Create your private region")}</h2>

          <form noValidate onSubmit={handleSave}>
            <div className="mb-3">
              <FormControl
                id="teanant-create-name"
                type="text"
                label={t("tenant.edit.name", "Name of your tenant")}
                value={changes.tenantName}
                onChange={(value) => setChanges({ ...changes, tenantName: value })}
              />
            </div>
            <Fields
              region={changes}
              onChange={(newChanges) =>
                setChanges((changes) => ({ tenantName: changes.tenantName, ...newChanges }))
              }
            />
            <div className="form-actions">
              <ButtonSave submit id="tenant-create-submit" isBusy={isBusy} />
              <ButtonCancel
                id="tenant-create-cancel"
                disabled={isBusy}
                onClick={() => Router.go("profile")}
              />
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

// for Blaze
import "./template.html";

Template.registerHelper("TenantCreatePage", () => TenantCreatePage);
