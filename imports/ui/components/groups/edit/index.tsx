import { Router } from "meteor/iron:router";
import React, { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { uniq, union, chain } from "lodash-es";

import * as Alert from "/imports/api/alerts/alert";
import { GroupModel, FindParams, isPrivate } from "/imports/api/groups/groups";
import * as GroupsMethods from "/imports/api/groups/methods";
import { Regions } from "/imports/api/regions/regions";

import { PublicSettings, RoleEntity } from "/imports/utils/PublicSettings";
import * as StringTools from "/imports/utils/string-tools";
import { useAccountTasks } from "/imports/utils/useAccountTasks";
import { cx } from "/imports/utils/cx";

import * as Analytics from "/imports/ui/lib/analytics";

import { ButtonCancel, ButtonSave } from "../../Buttons";
import { PricePolicy } from "../../price-policy";
import { Tag } from "../../regions/tag";
import { Title } from "./title";
import { useFindFilter as useOrganizationsFindFilter } from "/imports/api/organizations/publications";
import { useAll as useRegions } from "/imports/api/regions/publications";
import { useUser } from "/imports/utils/react-meteor-data";
import { useValidation } from "/imports/ui/lib/useValidation";
import { useCurrentRegionId } from "/imports/utils/useCurrentRegion";
import { useMeasureTime } from "/imports/ui/lib/useMeasureTime";

import { EditCustomFields } from "../../EditCustomFields";
import { SelectCategories } from "../SelectCategories";
import { GroupCategories } from "../categories";
import { FormCheck } from "/imports/ui/components/FormCheck";
import { RegionSelect } from "/imports/ui/components/RegionSelect";
import { Header } from "./Header";
import { FindHeader } from "./FindHeader";
import { AlertMessage } from "./AlertMessage";
import { FormControl } from "/imports/ui/components/form-control";
import { useFiltering } from "/imports/utils/filtering";
import { RoleSelect } from "/imports/ui/components/groups/edit/RoleSelect";

import "./styles.scss";

export type Props = {
  _id?: string;
  categories?: string[];
  isFrame?: boolean;
  organization?: string;
  teamOrganizations?: string[];
  hideRoleSelection?: boolean;
  hidePricePolicy?: boolean;
  roles?: string[];
  creatorsRoles?: string[];
  singleEvent?: boolean;
  hideCategories?: boolean;
  internal?: boolean;
  groupsQuery?: ReturnType<typeof useFiltering<typeof FindParams>>["asQuery"];
} & Partial<GroupModel>;

export function Edit(props: Props) {
  const isNew = !props._id;
  const { t } = useTranslation();

  const user = useUser();

  const currentRegion = useCurrentRegionId();
  const [regionsIsLoading, regions] = useRegions();

  const [isBusy, setIsBusy] = useState(false);
  const [title, setTitle] = useState(props.name);

  const { adjustLoginModalPosition, promptToLogin } = useAccountTasks();

  function showInternalCheckbox() {
    let internalOption;

    if (!props.isFrame && props.organization && user?.organizations) {
      // Visible in organization detail page (for creation) if user is in organization
      internalOption = user.organizations.includes(props.organization);
    } else {
      // and visible on edit if group is in a organization
      // For devs: This behavior is not consistent. But we want the creation to be as simple
      // as possible.
      internalOption = (props.organizations?.length || 0) > 0;
    }
    return internalOption;
  }

  const hasTeamOrganizations = !!(props.teamOrganizations && props.teamOrganizations?.length > 0);

  let internalInitialState;
  if (showInternalCheckbox()) {
    // Usually an "internal" checkbox is displayed so that the users of a organization can choose
    // whether the group is internal or not.
    internalInitialState = props.internal;
  } else if (props.isFrame && hasTeamOrganizations) {
    // When in a frame for a organization, the `internal` query-param can be set to control whether
    // the organization wants the entered groups to be internal.
    internalInitialState = props.internal;
  }
  // Default is not internal
  internalInitialState = internalInitialState || false;

  const [internal, setInternal] = useState(internalInitialState);

  useEffect(() => {
    setTitle(props.name);
  }, [props.name]);

  const [savedGroupId, setSavedGroupId] = useState<string | undefined>(undefined);

  const [selectedRegion, setSelectedRegion] = useState<string | undefined>(props.region);
  // init selected region
  useEffect(() => {
    if (!isNew) {
      // only needed for new groups
      return;
    }

    if (props.isFrame && props.region) {
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

    if (!isNew) {
      organizations.push(...(props.teamOrganizations || []));
    } else if (!props.isFrame) {
      if (props.organization) {
        organizations.push(props.organization);
      }
    } else if (props.teamOrganizations && props.teamOrganizations.length > 0) {
      organizations.push(...props.teamOrganizations);
    }
    // remove double organizations
    return uniq(organizations);
  }

  const [organizationsIsLoading, organizations] = useOrganizationsFindFilter({
    ids: getOrganizations(),
  });

  const [description, setDescription] = useState(props.description);
  const [numberOfCharacters, setNumberOfCharacters] = useState(0);
  const {
    start: startMeasureFocusTime,
    pause: pauseMeasureFocusTime,
    reset: resetFocusTime,
    time: totalFocusTime,
  } = useMeasureTime();

  const [editingCategories, setEditingCategories] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  /**
   * fullRoleSelection is used in the group edit view.
   * When disabled, a simpler view is shown. This is used in /frame/propose
   */
  const [fullRoleSelection, setFullRoleSelection] = useState(true);
  // For iframes: On true shows a simple role selection like: [I want to learn] [I can teach]
  const [simpleRoleSelection, setSimpleRoleSelection] = useState(false);
  // For iframes: Keep state of simple role selection
  const [simpleSelectedRole, setSimpleSelectedRole] = useState("participant");

  const [customFieldValues, setCustomFieldValues] = useState(props.customFields);

  const [savedMessage, setSavedMessage] = useState(false);

  const [roles, setRoles] = useState<
    Record<
      RoleEntity["type"],
      {
        enabled: boolean;
        enroll: boolean;
      }
    >
  >({});

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
      // Region can be set for new groups only.
      isNew &&
      // For the proposal frame we hide the region selection when a region is set.
      !(props.isFrame && props.region) &&
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
    setSelectedCategories([]);
    setSimpleSelectedRole("participant");
    resetFocusTime();
  };

  useEffect(() => {
    // Show category selection right away for new groups
    setEditingCategories(false);
    setSelectedCategories(props.categories || []);

    if (props.isFrame) {
      // When we're in the propose frame, show a simplified role selection
      setSimpleRoleSelection(!props.hideRoleSelection && !!props.roles?.includes("mentor"));
      setFullRoleSelection(false);
    }
  }, [isNew, props.categories, props.isFrame, props.hideRoleSelection, props.roles]);

  function simpleRoleActiveClass(role: string) {
    // HACK using btn-add and btn-edit to show activation state
    // It would be better to introduce own classes for this task.
    if (simpleSelectedRole === role) {
      return "btn-add active";
    }
    return "btn-edit";
  }
  function showMoreInfo() {
    return showRegionSelection() || customFields().length > 0;
  }
  function hideCategories() {
    return props.isFrame && props.hideCategories;
  }
  function selectCategoriesAttr() {
    return {
      categories: selectedCategories,
      onChange: (newSelectedCategories: string[]) => {
        setSelectedCategories(newSelectedCategories);
      },
    };
  }
  function showSavedMessage() {
    if (props.isFrame) {
      return savedMessage;
    }
    return false;
  }

  function hasPricePolicy() {
    const { hidePricePolicy } = props;

    if (hidePricePolicy) {
      return false;
    }

    if (props && props._id /* is not new */) {
      return !(props.tenant && isPrivate(props as { tenant: string }));
    }

    let regionId;
    if (props.isFrame && props.region) {
      // The region was preset for the frame
      regionId = props.region;
    } else if (regions.length === 1) {
      // There is only one region
      regionId = regions[0]._id;
    } else if (selectedRegion) {
      // The one selected by the user.
      regionId = selectedRegion;
    } else {
      return true;
    }

    const region = regions.find((r) => r._id === regionId);
    return !region?.isPrivate();
  }

  const handleRoleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSimpleSelectedRole(event.target.value);
  };

  async function handleSave(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!checkValidity()) {
      setTimeout(() => {
        document.querySelector<HTMLElement>(".is-invalid")?.focus();
      }, 0);
      return;
    }

    const changes = {
      internal,
      name: StringTools.sanitizeSingleline(title),
      categories: selectedCategories || [],
    } as unknown as Required<GroupsMethods.SaveFields>;

    if (description) {
      changes.description = description;
    }

    if (isNew) {
      changes.region = selectedRegion || "";

      if (props.singleEvent !== undefined) {
        changes.singleEvent = props.singleEvent;
      } else {
        const singleEvent = regions.find((r) => r._id === changes.region)?.singleEvents;

        if (singleEvent !== undefined) {
          changes.singleEvent = singleEvent;
        }
      }

      changes.organizations = getOrganizations();
    }

    changes.roles = {};
    changes.subs = [];
    changes.unsubs = [];

    if (props.isFrame) {
      props.roles?.forEach((role) => {
        changes.roles[role] = true;
      });

      if (simpleRoleSelection && simpleSelectedRole === "mentor") {
        changes.subs.push("mentor");
      }

      changes.subs = union(changes.subs, props.creatorsRoles || []);
    }

    if (fullRoleSelection) {
      Object.entries(roles).forEach(function (r) {
        changes.roles[r[0]] = r[1].enabled;
      });
      Object.entries(roles)
        .filter((r) => r[1].enabled)
        .forEach(function (r) {
          const role = r[0];
          const subscribe = !!r[1].enroll;
          if (subscribe) {
            changes.subs.push(role);
          } else {
            changes.unsubs.push(role);
          }
        });
    }

    if (customFieldValues) {
      changes.customFields = customFieldValues;
    }

    setIsBusy(true);
    try {
      adjustLoginModalPosition(event.nativeEvent);
      if (!(await promptToLogin())) {
        return;
      }

      const groupId = await GroupsMethods.save(props._id || "", changes);

      Analytics.trackEvent(
        "Group creations",
        `Group creations as ${changes.subs.length > 0 ? changes.subs.sort().join(" and ") : "participant"}`,
        Regions.findOne(changes.region)?.nameEn,
        totalFocusTime(),
      );

      if (props.isFrame) {
        setSavedGroupId(groupId);
        setSavedMessage(true);
        resetFields();
      } else {
        if (isNew) {
          Router.go("showGroup", { _id: groupId }, { query: { nextActions: "1" } });
        } else {
          Alert.success(
            t("message.groupChangesSaved", "Your changes to {NAME} have been saved.", {
              NAME: changes.name,
            }),
          );
          Router.go("showGroup", { _id: groupId });
        }
      }
    } catch (err) {
      if (!addError(err.reason)) {
        // unknown error
        Alert.serverError(err, t("message.groupChangesSaved.error", "Saving went wrong"));
      }
    } finally {
      setIsBusy(false);
    }
  }

  function handleCancel() {
    const group = props;

    if (group._id) {
      Router.go("showGroup", group);
    } else {
      Router.go("home");
    }
  }

  const disabledCreateRoles = useMemo(() => {
    return chain(organizations)
      .flatMap(({ disableCreateRoles }) => disableCreateRoles ?? [])
      .uniq()
      .value();
  }, [organizations]);

  if (regionsIsLoading() || organizationsIsLoading()) {
    return null;
  }

  return (
    <div className="edit-page">
      <form noValidate onSubmit={handleSave}>
        {props.groupsQuery ? (
          <FindHeader {...props} groupsQuery={props.groupsQuery} />
        ) : (
          <Header {...props} />
        )}
        <div className={cx("edit-page-body group-edit-body", props.isFrame && "is-frame")}>
          {!isNew && !!props.region && <Tag region={props.region} />}
          {showSavedMessage() && !!savedGroupId && (
            <AlertMessage
              isFrame={props.isFrame}
              savedGroupId={savedGroupId}
              onClose={() => setSavedMessage(false)}
            />
          )}

          {simpleRoleSelection && (
            <div className="mb-3">
              <label className="form-label" id="learnOrTeachTitle">
                {t("group.edit.learnOrTeach", "Learn or teach?")}
              </label>
              <div
                className="btn-group-toggle row"
                role="group"
                aria-labelledby="learnOrTeachTitle"
              >
                <div className="col d-grid">
                  <label className={cx("btn btn-lg", simpleRoleActiveClass("participant"))}>
                    <input
                      className="d-none"
                      type="radio"
                      name="role"
                      value="participant"
                      checked={simpleSelectedRole === "participant"}
                      onChange={handleRoleChange}
                    />
                    <i className="fa-solid fa-user fa-lg fa-fw" />{" "}
                    {t("group.edit.iWantToLearn", "I want to learn")}
                  </label>
                </div>
                <div className="col d-grid">
                  <label className={cx("btn btn-lg", simpleRoleActiveClass("mentor"))}>
                    <input
                      className="d-none"
                      type="radio"
                      name="role"
                      value="mentor"
                      checked={simpleSelectedRole === "mentor"}
                      onChange={handleRoleChange}
                    />
                    <i className="fa-solid fa-graduation-cap fa-lg fa-fw" />{" "}
                    {t("group.edit.iCanTeach", "I can teach")}
                  </label>
                </div>
              </div>
            </div>
          )}

          <Title
            value={title}
            onChange={(newTitle) => setTitle(newTitle)}
            showOtherProposals={isNew}
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
          {hasPricePolicy() && <PricePolicy dismissible wrap="mb-3" />}
          <div className="row gap-3 mb-3">
            {!hideCategories() && (
              <div className="col-md">
                {editingCategories ? (
                  <SelectCategories {...selectCategoriesAttr()} />
                ) : (
                  <>
                    {!isNew && (
                      <div className="form-label">
                        {t("group.edit.categoriesOptional", "Categories (optional)")}
                      </div>
                    )}
                    {!isNew && props.categories && props.categories.length > 0 && (
                      <GroupCategories categories={props.categories} />
                    )}
                    <button
                      type="button"
                      className="btn btn-edit"
                      onClick={() => setEditingCategories(true)}
                    >
                      {isNew
                        ? t("group.edit.addCategories", "Add categories")
                        : t("group.edit.editCategories")}
                    </button>
                  </>
                )}
              </div>
            )}

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

            {!!selectedRegion && (
              <RoleSelect
                selectedRegion={selectedRegion}
                value={roles}
                onChange={setRoles}
                isNewGroup={isNew}
                defaultRoles={props.roles}
                defaultUsersRoles={
                  props.members?.find((member) => member.user === user?._id)?.roles
                }
                fullRoleSelection={fullRoleSelection}
                disabledCreateRoles={disabledCreateRoles}
              />
            )}
          </div>
          <EditCustomFields
            type="multiLine"
            fields={customFields()}
            values={customFieldValues}
            onChange={(values) => setCustomFieldValues(values)}
          />

          {showInternalCheckbox() && (
            <div className="mb-3">
              <div className="form-label">{t("group.edit.intern", "Hide on front page")}</div>
              <FormCheck
                id="group-edit-internal"
                type="box"
                label={t(
                  "group.edit.internDescription",
                  "Only show when looking at a organization's groups",
                )}
                checked={internal}
                onChange={(checked) => setInternal(checked)}
              />
            </div>
          )}

          <div className="form-actions">
            <ButtonSave submit id="groups-edit-save" isBusy={isBusy} />
            {!props.isFrame && (
              <ButtonCancel id="groups-edit-cancel" onClick={handleCancel} disabled={isBusy} />
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
