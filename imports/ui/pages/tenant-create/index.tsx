import React, { useState } from "react";
import { Router } from "meteor/iron:router";
import { omit } from "lodash-es";
import * as Analytics from "/imports/ui/lib/analytics";
import { MetaTags } from "/imports/ui/components/MetaTags";
import { useTranslation } from "react-i18next";
import { useAccountTasks } from "/imports/ui/hooks/useAccountTasks";
import { useValidation } from "/imports/ui/hooks/useValidation";

import * as Alert from "/imports/api/alerts/alert";
import { TenantModel } from "/imports/api/tenants/tenants";
import { RegionModel } from "/imports/api/regions/regions";
import * as TenantsMethods from "/imports/api/tenants/methods";
import * as RegionsMethods from "/imports/api/regions/methods";

import { Fields } from "../../components/regions/edit/Fields";
import { ButtonCancel, ButtonSave } from "/imports/ui/components/Buttons";
import { FormControl } from "/imports/ui/components/form-control";

export interface Props {
  tenant: TenantModel;
  region: RegionModel;
}

export function TenantCreatePage(props: Props) {
  const { t } = useTranslation();

  const [changes, setChanges] = useState({
    tenantName: props.tenant.name,
    name: props.region.name,
    description: props.region.description,
    tz: props.region.tz,
    loc: props.region.loc,
  });

  const [errors, checkValidity, addError] = useValidation(
    {
      noTenantName: {
        field: "tenantName",
        isValid: () => !!changes.tenantName,
        text: () => t("tenant.create.plsGiveName", "Please give a name"),
      },
      noRegionName: {
        field: "regionName",
        isValid: () => !!changes.name,
        text: () => t("tenant.region.create.plsGiveName", "Please give your region a name"),
      },
      noLocation: {
        field: "location",
        isValid: () => !!changes.loc,
        text: () =>
          t(
            "tenant.region.create.plsSelectPointOnMap",
            'Please add a marker on the map by clicking on the "+" sign.',
          ),
      },
    },
    { autoCheckFixed: true },
  );

  const { promptToLogin } = useAccountTasks();
  const [isBusy, setIsBusy] = useState(false);

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!checkValidity()) {
      setTimeout(() => {
        document.querySelector<HTMLElement>(".is-invalid")?.focus();
      }, 0);
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
      if (!(err instanceof Meteor.Error && err.reason && addError(err.reason))) {
        // unknown error
        Alert.serverError(err, t("privateRegion.creating.error", "Creating the region went wrong"));
      }
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

          <form noValidate onSubmit={handleSubmit}>
            <div className="mb-3">
              <FormControl
                id="tenant-edit-name"
                type="text"
                label={t("tenant.edit.name", "Name of your tenant")}
                value={changes.tenantName}
                onChange={(value) => setChanges({ ...changes, tenantName: value })}
                onBlur={() => checkValidity("tenantName")}
                error={errors.tenantName}
              />
            </div>
            <Fields
              region={changes}
              onChange={(newChanges) =>
                setChanges((changes) => ({ tenantName: changes.tenantName, ...newChanges }))
              }
              onBlur={(field) => checkValidity(field)}
              errors={errors}
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
