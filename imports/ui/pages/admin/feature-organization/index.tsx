import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import * as Alert from "/imports/api/alerts/alert";
import * as Groups from "../../../../api/organizations/publications";
import * as RegionsMethods from "/imports/api/regions/methods";
import { useCurrentRegion } from "/imports/utils/useCurrentRegion";

import "./styles.scss";

export function AdminFeatureGroupPage() {
  const { t } = useTranslation();
  const [isBusy, setIsBusy] = useState(false);
  const currentRegion = useCurrentRegion();
  const [groupToBeFeatured, setGroupToBeFeatured] = useState(currentRegion?.featuredGroup || "");

  const [isLoading, groups] = Groups.useFindFilter({}, undefined, undefined, [["name", "asc"]]);

  function featuredGroup() {
    const groupId = currentRegion?.featuredGroup;
    if (!groupId) {
      return undefined;
    }
    return groups.find((g) => g._id === groupId);
  }

  if (isLoading()) {
    return null;
  }

  return (
    <>
      {!!featuredGroup() && (
        <div className="admin-featured-group">
          <div className="mb-2">
            {t(
              "featureGroup.groupIsFeatured",
              'The "{GROUP}" group is featured for the "{REGION}" region.',
              { GROUP: featuredGroup()?.name, REGION: currentRegion?.name },
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
                await RegionsMethods.unsetFeaturedGroup(currentRegion._id);
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
              t("featureGroup.deleteButton", 'Remove the featured group for "{REGION}"', {
                REGION: currentRegion?.name,
              })
            )}
          </button>
        </div>
      )}
      <h3>{t("featureGroup.featureGroup", "Feature group")}</h3>
      <form
        onSubmit={async (event) => {
          event.preventDefault();

          if (!currentRegion) {
            return;
          }

          setIsBusy(true);
          try {
            await RegionsMethods.featureGroup(currentRegion._id, groupToBeFeatured);
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
              setGroupToBeFeatured(event.currentTarget.value);
            }}
            defaultValue={groupToBeFeatured}
          >
            <option value="" disabled className="select-placeholder">
              {t("_selection.pleaseSelect")}
            </option>
            {groups.map((group) => (
              <option key={group._id} value={group._id}>
                {group.name}
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
              t("featureGroup.saveButton", 'Feature this group in the "{REGION}" region', {
                REGION: currentRegion?.name,
              })
            )}
          </button>
        </div>
      </form>
    </>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("AdminFeatureGroupPage", () => AdminFeatureGroupPage);
