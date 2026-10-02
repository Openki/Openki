import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "/imports/ui/hooks/react-meteor-data";

import * as Alert from "/imports/api/alerts/alert";
import { RegionModel } from "/imports/api/regions/regions";
import { geoLocationLink } from "/imports/utils/geoLocationLink";
import { format as locationFormat } from "/imports/utils/location-format";
import {
  DeleteConfirmDialog,
  type Props as DeleteConfirmDialogProps,
} from "/imports/ui/components/delete-confirm-dialog";
import { ButtonEdit, ButtonDelete } from "../../Buttons";
import { Display as LocationDisplay } from "/imports/ui/components/location/display";

import "./styles.scss";

export interface Props {
  region: RegionModel;
  onEdit: () => void;
  onDelete: () => Promise<void>;
}

export function Display({ region, onEdit, onDelete }: Props) {
  const { t } = useTranslation();
  const user = useUser();

  const [verifyDelete, setVerifyDelete] = useState(false);

  function deleteConfirmDialogAttr(): DeleteConfirmDialogProps {
    return {
      confirmText: t(
        "region.reallyDelete",
        "Please confirm that you would like to delete this region with all groups, events and venues. This cannot be undone.",
      ),
      confirmButton: t("region.detail.remove", "Remove this region"),
      busyButton: t("region.detail.remove.busy", "Deleting region…"),
      onCancel: async () => {
        setVerifyDelete(false);
      },
      onRemove: async () => {
        try {
          await onDelete();
          Alert.success(t("region.removed", 'Removed region "{NAME}".', { NAME: region.name }));
        } catch (err) {
          Alert.serverError(err, t("region.deleting.error", "Deleting the region went wrong"));
        } finally {
          setVerifyDelete(false);
        }
      },
    };
  }

  return (
    <div className="page-component">
      <div className="details-header region-details-header">
        <h3>{region.name}</h3>
      </div>

      <div className="details-body region-details-body">
        <div className="details-content">
          <div className="row">
            <div className={region.loc ? "col-md-7" : "col"}>
              {!!region.tz && (
                <p>
                  <span className="region-property-title">
                    {t("regionDetails.timezone", "Timezone:")}
                  </span>{" "}
                  {region.tz}
                </p>
              )}
              {!!region.description && (
                <div>
                  <div className="region-property-title">
                    {t("tenant.details.regions.description")}:
                  </div>
                  <div className="text-break">{region.description}</div>
                </div>
              )}
            </div>

            {!!region.loc && (
              <div className="col-md-5">
                <div className="details-map">
                  <LocationDisplay coordinates={region.loc.coordinates} zoom={13} />
                  <div className="coordinates">
                    <a href={geoLocationLink(region.loc)}>
                      {t("regionDetails.coordinates", "Coordinates:")}{" "}
                      {locationFormat(t, region.loc)}
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {region.editableBy(user) && (
        <>
          <div className="actions">
            <ButtonEdit
              id="regions-display-edit"
              onClick={() => {
                onEdit();
                setVerifyDelete(false);
              }}
            />
            {!verifyDelete && (
              <ButtonDelete
                id="regions-display-verifyDelete"
                onClick={async () => setVerifyDelete(true)}
              />
            )}
          </div>
          {verifyDelete && <DeleteConfirmDialog {...deleteConfirmDialogAttr()} />}
        </>
      )}
    </div>
  );
}
