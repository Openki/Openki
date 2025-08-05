import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { Geodata, RegionEntity } from "/imports/api/regions/regions";
import * as Alert from "/imports/api/alerts/alert";

import { Fields } from "./fields";
import { ButtonCancel, ButtonSave } from "../../buttons";
import { PleaseLogin } from "../../please-login";

import "./styles.scss";

export interface Data {
  region: RegionEntity;
  title: string;
  onSave: (changes: OnSaveFields) => Promise<void>;
  onCancel: () => void;
}

export interface OnSaveFields {
  name: string;
  tz: string;
  description: string;
  loc: Geodata;
}

export function Edit(data: Data) {
  const { t } = useTranslation();

  const [changes, setChanges] = useState({
    name: data.region.name,
    description: data.region.description,
    tz: data.region.tz,
    loc: data.region.loc as Geodata | undefined,
  });

  async function handleSave() {
    if (!changes.name) {
      Alert.error(t("region.create.plsGiveName", "Please give your region a name"));
      return;
    }

    if (!changes.loc) {
      Alert.error(
        t(
          "region.create.plsSelectPointOnMap",
          'Please add a marker on the map by clicking on the "+" sign.',
        ),
      );
      return;
    }

    try {
      await data.onSave(changes as OnSaveFields);

      Alert.success(
        t("region.saving.success", 'Saved changes to region "{NAME}".', {
          NAME: changes.name,
        }),
      );
    } catch (err) {
      Alert.serverError(err, t("region.saving.error", "Saving the region went wrong"));
    }
  }

  return (
    <div className="edit-page region-edit">
      <h2>{data.title}</h2>
      <PleaseLogin type="form" onSubmit={handleSave}>
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
  );
}

// for Blaze
import "./template.html";

Template.registerHelper("RegionEdit", () => Edit);
