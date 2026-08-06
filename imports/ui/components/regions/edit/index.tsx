import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAccountTasks } from "/imports/utils/useAccountTasks";

import { RegionEntity } from "/imports/api/regions/regions";
import { Geodata } from "/imports/api/Geodata";
import * as Alert from "/imports/api/alerts/alert";

import { Fields } from "./Fields";
import { ButtonCancel, ButtonSave } from "../../Buttons";

import "./styles.scss";
import { useValidation } from "/imports/ui/lib/useValidation";

export interface Props {
  title: string;
  region: RegionEntity;
  onSave: (changes: OnSaveFields) => Promise<void>;
  onCancel: () => void;
}

export interface OnSaveFields {
  name: string;
  tz: string;
  description: string;
  loc: Geodata;
}

export function Edit(props: Props) {
  const { t } = useTranslation();

  const [changes, setChanges] = useState({
    name: props.region.name,
    description: props.region.description,
    tz: props.region.tz,
    loc: props.region.loc,
  });
  const [errors, checkValidity, addError] = useValidation(
    {
      noName: {
        field: "regionName",
        isValid: () => !!changes.name,
        text: () => t("region.create.plsGiveName", "Please give your region a name"),
      },
      noLocation: {
        field: "location",
        isValid: () => !!changes.loc,
        text: () =>
          t(
            "region.create.plsSelectPointOnMap",
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

      await props.onSave(changes as OnSaveFields);

      Alert.success(
        t("region.saving.success", 'Saved changes to region "{NAME}".', {
          NAME: changes.name,
        }),
      );
    } catch (err) {
      if (!(err instanceof Meteor.Error && err.reason && addError(err.reason))) {
        // unknown error
        Alert.serverError(err, t("region.saving.error", "Saving the region went wrong"));
      }
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="edit-page region-edit">
      <h2>{props.title}</h2>
      <form noValidate onSubmit={handleSubmit}>
        <Fields
          region={changes}
          onChange={(newChanges) => setChanges(newChanges)}
          onBlur={(field) => checkValidity(field)}
          errors={errors}
        />
        <div className="form-actions">
          <ButtonSave submit id="regions-edit-save" isBusy={isBusy} />
          <ButtonCancel
            id="regions-edit-cancel"
            disabled={isBusy}
            onClick={() => props.onCancel()}
          />
        </div>
      </form>
    </div>
  );
}
