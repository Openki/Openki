import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAccountTasks } from "/imports/utils/useAccountTasks";

import { RegionEntity } from "/imports/api/regions/regions";
import { Geodata } from "/imports/api/Geodata";
import * as Alert from "/imports/api/alerts/alert";

import { Fields } from "./Fields";
import { ButtonCancel, ButtonSave } from "../../Buttons";

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
    loc: data.region.loc,
  });

  const { promptToLogin } = useAccountTasks();
  const [isBusy, setIsBusy] = useState(false);

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

    setIsBusy(true);
    try {
      if (!(await promptToLogin())) {
        return;
      }

      await data.onSave(changes as OnSaveFields);

      Alert.success(
        t("region.saving.success", 'Saved changes to region "{NAME}".', {
          NAME: changes.name,
        }),
      );
    } catch (err) {
      Alert.serverError(err, t("region.saving.error", "Saving the region went wrong"));
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="edit-page region-edit">
      <h2>{data.title}</h2>
      <form noValidate onSubmit={handleSave}>
        <Fields region={changes} onChange={(newChanges) => setChanges(newChanges)} />
        <div className="form-actions">
          <ButtonSave submit id="regions-edit-save" isBusy={isBusy} />
          <ButtonCancel
            id="regions-edit-cancel"
            disabled={isBusy}
            onClick={() => data.onCancel()}
          />
        </div>
      </form>
    </div>
  );
}
