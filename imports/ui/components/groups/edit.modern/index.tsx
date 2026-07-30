import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { uniq } from "lodash-es";

import * as Alert from "/imports/api/alerts/alert";
import * as GroupsMethods from "/imports/api/groups/methods";
import { Regions } from "/imports/api/regions/regions";
import { GroupCustomField } from "/imports/api/groups/groups";

import { PublicSettings } from "/imports/utils/PublicSettings";
import * as StringTools from "/imports/utils/string-tools";
import { useAccountTasks } from "/imports/utils/useAccountTasks";

import * as Analytics from "/imports/ui/lib/analytics";

import { Button } from "../../Buttons";
import { Title } from "./title";
import { useFindFilter as useOrganizationsFindFilter } from "/imports/api/organizations/publications";
import { useAll as useRegions } from "/imports/api/regions/publications";
import { useValidation } from "/imports/ui/lib/useValidation";
import { useCurrentRegionId } from "/imports/utils/useCurrentRegion";
import { useMeasureTime } from "/imports/ui/lib/useMeasureTime";

import { EditCustomFields } from "../../EditCustomFields";
import { RegionSelect } from "/imports/ui/components/RegionSelect";
import { AlertMessage } from "./AlertMessage";
import { FormControl } from "/imports/ui/components/form-control";

import "./styles.scss";

export interface Props {
  region?: string;
  organization?: string;
}

/**
 * This Group propose view is intended to be used for creating new groups inside of dashboard views.
 */
export function Edit(props: Props) {
  const { t } = useTranslation();

  const currentRegion = useCurrentRegionId();
  const [regionsIsLoading, regions] = useRegions();

  const [isBusy, setIsBusy] = useState(false);
  const [title, setTitle] = useState("");

  const { adjustLoginModalPosition, promptToLogin } = useAccountTasks();

  const [savedGroupId, setSavedGroupId] = useState<string | undefined>(undefined);

  const [selectedRegion, setSelectedRegion] = useState<string | undefined>(props.region);
  // init selected region
  useEffect(() => {
    if (props.region) {
      // The region was preset for the frame
      setSelectedRegion(props.region);
    } else if (currentRegion) {
      //  If the session sets the region, we use it.
      setSelectedRegion(currentRegion);
    } else if (regions.length === 1) {
      // Auto-select the region if there is only one available.
      setSelectedRegion(regions[0]._id);
    }
  }, [props, currentRegion, regions]);

  function getOrganizations() {
    const organizations = [];

    const defaultTeamOrganizations = regions.find(
      (r) => r._id === selectedRegion,
    )?.defaultTeamOrganizations;
    if (defaultTeamOrganizations) {
      organizations.push(...defaultTeamOrganizations);
    }

    if (props.organization) {
      organizations.push(props.organization);
    }

    // remove double organizations
    return uniq(organizations);
  }

  const [organizationsIsLoading, organizations] = useOrganizationsFindFilter({
    ids: getOrganizations(),
  });

  const [description, setDescription] = useState("");
  const [numberOfCharacters, setNumberOfCharacters] = useState(0);
  const {
    start: startMeasureFocusTime,
    pause: pauseMeasureFocusTime,
    reset: resetFocusTime,
    time: totalFocusTime,
  } = useMeasureTime();

  const [customFieldValues, setCustomFieldValues] = useState<GroupCustomField[] | undefined>(
    undefined,
  );

  const [savedMessage, setSavedMessage] = useState(false);

  const [errors, checkValidity, addError] = useValidation(
    {
      noTitle: {
        field: "title",
        isValid: () => StringTools.sanitizeSingleline(title).length > 0,
        text: () => t("group.edit.error.title", "Please provide a title"),
      },
      descriptionToLong: {
        field: "description",
        isValid: () =>
          !PublicSettings.groupDescriptionMax ||
          numberOfCharacters <= PublicSettings.groupDescriptionMax,
        text: () =>
          t("_inputField.maxlength", {
            MAXNUMBER: PublicSettings.groupDescriptionMax,
            NUMBER: numberOfCharacters - (PublicSettings.groupDescriptionMax || 0),
          }),
      },
      noRegion: {
        field: "region",
        isValid: () => !!selectedRegion,
        text: () => t("group.edit.error.region", "Please select a region"),
      },
    },
    { autoCheckFixed: true },
  );

  useEffect(() => {
    checkValidity("description");
  }, [description]);

  function showRegionSelection() {
    return (
      // We hide the region selection when a region is set.
      !props.region &&
      // if the session sets the region we hide the region selection
      !currentRegion &&
      // If there is only one region on this instance or it is visible to this
      // user, it will be set automatically.
      regions.length > 1
    );
  }

  const customFields = () => {
    return organizations.flatMap((o) => o.customGroupFields || []);
  };

  const resetFields = () => {
    setTitle("");
    setDescription("");
    resetFocusTime();
  };

  function showMoreInfo() {
    return showRegionSelection() || customFields().length > 0;
  }

  async function handleSave(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!checkValidity()) {
      setTimeout(() => {
        document.querySelector<HTMLElement>(".is-invalid")?.focus();
      }, 0);
      return;
    }

    const changes = {
      name: StringTools.sanitizeSingleline(title),
    } as unknown as Required<GroupsMethods.SaveFields>;

    if (description) {
      changes.description = description;
    }

    changes.region = selectedRegion || "";

    const singleEvent = regions.find((r) => r._id === changes.region)?.singleEvents;

    if (singleEvent !== undefined) {
      changes.singleEvent = singleEvent;
    }

    changes.organizations = getOrganizations();

    changes.roles = {};
    changes.subs = [];
    changes.unsubs = [];

    if (customFieldValues) {
      changes.customFields = customFieldValues;
    }

    setIsBusy(true);
    try {
      adjustLoginModalPosition(event.nativeEvent);
      if (!(await promptToLogin())) {
        return;
      }

      const groupId = await GroupsMethods.save("", changes);

      Analytics.trackEvent(
        "Group creations",
        `Group creations as ${changes.subs.length > 0 ? changes.subs.sort().join(" and ") : "participant"}`,
        Regions.findOne(changes.region)?.nameEn,
        totalFocusTime(),
      );

      setSavedGroupId(groupId);
      setSavedMessage(true);
      resetFields();
    } catch (err) {
      if (!addError(err.reason)) {
        // unknown error
        Alert.serverError(err, t("message.groupChangesSaved.error", "Saving went wrong"));
      }
    } finally {
      setIsBusy(false);
    }
  }

  if (regionsIsLoading() || organizationsIsLoading()) {
    return null;
  }

  return (
    <div className="edit-page">
      <form noValidate onSubmit={handleSave}>
        <div className="edit-page-body group-modern-edit-body mt-0 rounded-2 bg-body">
          {savedMessage && !!savedGroupId && (
            <AlertMessage savedGroupId={savedGroupId} onClose={() => setSavedMessage(false)} />
          )}

          <Title
            value={title}
            onChange={(newTitle) => setTitle(newTitle)}
            showOtherProposals
            onBlur={() => checkValidity("title")}
            error={errors.title}
          />
          <div className="mb-3">
            <FormControl
              id="group-edit-description"
              type="richtext"
              label={t("group.edit.description", "Description")}
              placeholder={t(
                "group.description.placeholder",
                "Describe your idea, so more people find it and know what to expect.",
              )}
              value={description || ""}
              onChange={(newValue, numberOfCharacters) => {
                setDescription(newValue);
                setNumberOfCharacters(numberOfCharacters);
              }}
              onFocus={() => startMeasureFocusTime()}
              onBlur={() => {
                pauseMeasureFocusTime();
                checkValidity("description");
              }}
              error={errors.description}
            />
          </div>
          <div className="row gap-3 mb-3">
            {showMoreInfo() && (
              <div className="col-md">
                {showRegionSelection() && (
                  <div className="mb-3">
                    <RegionSelect
                      id="groups-edit-region-select"
                      value={selectedRegion}
                      onChange={(value) => setSelectedRegion(value)}
                      onBlur={() => checkValidity("region")}
                      error={errors.region}
                    />
                  </div>
                )}

                <EditCustomFields
                  type="boolean"
                  fields={customFields()}
                  values={customFieldValues}
                  onChange={(values) => setCustomFieldValues(values)}
                />

                <EditCustomFields
                  type="singleLine"
                  fields={customFields()}
                  values={customFieldValues}
                  onChange={(values) => setCustomFieldValues(values)}
                />

                <EditCustomFields
                  type="option"
                  fields={customFields()}
                  values={customFieldValues}
                  onChange={(values) => setCustomFieldValues(values)}
                />
              </div>
            )}
          </div>
          <EditCustomFields
            type="multiLine"
            fields={customFields()}
            values={customFieldValues}
            onChange={(values) => setCustomFieldValues(values)}
          />

          <div className="form-actions">
            <Button
              submit
              id="groups-edit-save"
              className="btn-save"
              isBusy={isBusy}
              busyText={t("group.publishing", "Publishing…")}
            >
              {t("group.publish", "Publish")}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
