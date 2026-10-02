import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import * as Alert from "/imports/api/alerts/alert";
import * as Organizations from "/imports/api/organizations/publications";
import * as RegionsMethods from "/imports/api/regions/methods";
import { useCurrentRegion } from "/imports/ui/hooks/useCurrentRegion";

import "./styles.scss";

export function AdminFeatureOrganizationPage() {
  const { t } = useTranslation();
  const [isBusy, setIsBusy] = useState(false);
  const currentRegion = useCurrentRegion();
  const [organizationToBeFeatured, setOrganizationToBeFeatured] = useState(
    currentRegion?.featuredOrganization || "",
  );

  const [isLoading, organizations] = Organizations.useFindFilter({}, undefined, undefined, [
    ["name", "asc"],
  ]);

  function featuredOrganization() {
    const organizationId = currentRegion?.featuredOrganization;
    if (!organizationId) {
      return undefined;
    }
    return organizations.find((o) => o._id === organizationId);
  }

  if (isLoading()) {
    return null;
  }

  return (
    <>
      {!!featuredOrganization() && (
        <div className="admin-featured-organization">
          <div className="mb-2">
            {t(
              "admin.featureOrganization.organizationIsFeatured",
              'The "{ORGANIZATION}" organization is featured for the "{REGION}" region.',
              { ORGANIZATION: featuredOrganization()?.name, REGION: currentRegion?.name },
            )}
          </div>
          <button
            type="button"
            className="btn btn-delete"
            disabled={isBusy}
            onClick={async () => {
              if (!currentRegion) {
                return;
              }

              setIsBusy(true);
              try {
                await RegionsMethods.unsetFeaturedOrganization(currentRegion._id);
              } catch (err) {
                Alert.serverError(err);
              } finally {
                setIsBusy(false);
              }
            }}
          >
            {isBusy ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin fa-fw" /> {t("_button.deleting")}
              </>
            ) : (
              t(
                "admin.featureOrganization.deleteButton",
                'Remove the featured organization for "{REGION}"',
                {
                  REGION: currentRegion?.name,
                },
              )
            )}
          </button>
        </div>
      )}
      <h3>{t("admin.featureOrganization.featureOrganization", "Feature organization")}</h3>
      <form
        onSubmit={async (event) => {
          event.preventDefault();

          if (!currentRegion) {
            return;
          }

          setIsBusy(true);
          try {
            await RegionsMethods.featureOrganization(currentRegion._id, organizationToBeFeatured);
          } catch (err) {
            Alert.serverError(err);
          } finally {
            setIsBusy(false);
          }
        }}
      >
        <div className="mb-3">
          <select
            className="form-select"
            onChange={(event) => {
              setOrganizationToBeFeatured(event.currentTarget.value);
            }}
            defaultValue={organizationToBeFeatured}
          >
            <option value="" disabled className="select-placeholder">
              {t("_selection.pleaseSelect")}
            </option>
            {organizations.map((organization) => (
              <option key={organization._id} value={organization._id}>
                {organization.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-save" disabled={isBusy}>
            {isBusy ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin fa-fw" /> {t("_button.saving")}
              </>
            ) : (
              t(
                "admin.featureOrganization.saveButton.feature",
                'Feature this organization in the "{REGION}" region',
                {
                  REGION: currentRegion?.name,
                },
              )
            )}
          </button>
        </div>
      </form>
    </>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("AdminFeatureOrganizationPage", () => AdminFeatureOrganizationPage);
