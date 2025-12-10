import { Router } from "meteor/iron:router";
import React, { ChangeEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { uniq, chain, fromPairs, union } from "lodash-es";

import * as Alert from "/imports/api/alerts/alert";
import {
  CourseMemberEntity,
  CourseModel,
  FindParams,
  isPrivate,
} from "/imports/api/courses/courses";
import * as CoursesMethods from "/imports/api/courses/methods";
import { Regions } from "/imports/api/regions/regions";
import { Roles } from "/imports/api/roles/roles";

import { PublicSettings } from "/imports/utils/PublicSettings";
import { hasRoleUser } from "/imports/utils/course-role-utils";
import * as StringTools from "/imports/utils/string-tools";
import { useAccountTasks } from "/imports/utils/useAccountTasks";

import * as Analytics from "/imports/ui/lib/analytics";

import { ButtonCancel, ButtonSave } from "../../Buttons";
import { PricePolicy } from "../../price-policy";
import { Tag } from "../../regions/tag";
import { Props as CourseEditRoleProps, Role } from "./Role";
import { Title } from "./title";
import { useFindFilter as useOrganizationsFindFilter } from "../../../../api/organizations/publications";
import { useAll as useRegions } from "/imports/api/regions/publications";
import { useUser } from "/imports/utils/react-meteor-data";
import { useValidation } from "/imports/ui/lib/useValidation";
import { useCurrentRegionId } from "/imports/utils/useCurrentRegion";
import { useMeasureTime } from "/imports/ui/lib/useMeasureTime";

import { EditCustomFields } from "../../EditCustomFields";
import { SelectCategories } from "../SelectCategories";
import { CourseCategories } from "../categories";
import { FormCheck } from "/imports/ui/components/FormCheck";
import { RegionSelect } from "/imports/ui/components/RegionSelect";
import { Header } from "./Header";
import { FindHeader } from "./FindHeader";
import { AlertMessage } from "./AlertMessage";
import { FormControl } from "/imports/ui/components/form-control";
import { useFiltering } from "/imports/utils/filtering";

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
  coursesQuery?: ReturnType<typeof useFiltering<typeof FindParams>>["asQuery"];
} & Partial<CourseModel>;

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

    if (!props.isFrame && props.organization && user?.groups) {
      // Visible in organization detail page (for creation) if user is in organization
      internalOption = user.groups.includes(props.organization);
    } else {
      // and visible on edit if course is in a organization
      // For devs: This behaviour is not consistent. But we want the creation to be as simple
      // as possible.
      internalOption = (props.groups?.length || 0) > 0;
    }
    return internalOption;
  }

  const hasTeamOrganizations = !!(props.teamOrganizations && props.teamOrganizations?.length > 0);

  let internalInitalState;
  if (showInternalCheckbox()) {
    // Usually an "internal" checkbox is displayed so that the users of a group can choose
    // whether the course is internal or not.
    internalInitalState = props.internal;
  } else if (props.isFrame && hasTeamOrganizations) {
    // When in a frame for a organization, the `internal` query-param can be set to control whether
    // the organization wants the entered courses to be internal.
    internalInitalState = props.internal;
  }
  // Default is not internal
  internalInitalState = internalInitalState || false;

  const [internal, setInternal] = useState(internalInitalState);

  useEffect(() => {
    setTitle(props.name);
  }, [props.name]);

  const [savedCourseId, setSavedCourseId] = useState<string | undefined>(undefined);

  const [selectedRegion, setSelectedRegion] = useState<string | undefined>(props.region);
  // init selected region
  useEffect(() => {
    if (!isNew) {
      // only needed for new courses
      return;
    }

    if (props.isFrame && props.region) {
      // The region was preset for the frame
      setSelectedRegion(props.region);
    } else if (currentRegion) {
      //  If the session sets the region, we use it.
      setSelectedRegion(currentRegion);
    } else if (regions.length === 1) {
      // There is only one region
      setSelectedRegion(regions[0]._id);
    }
  }, [props, currentRegion, regions]);

  function getOrganizations() {
    const organizations = [];

    const defaultTeamOrganizations = regions.find(
      (r) => r._id === selectedRegion,
    )?.defaultTeamGroups;
    if (defaultTeamOrganizations) {
      organizations.push(...defaultTeamOrganizations);
    }

    if (!isNew) {
      organizations.push(...(props.organizationOrganizers || []));
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
  const [fullRoleSelection, setFullRoleSelection] = useState(true);
  // For iframes: On true shows a simple role selection like: [I want to learn] [I can teach]
  const [simpleRoleSelection, setSimpleRoleSelection] = useState(false);
  // For iframes: Keep state of simple role selection
  const [simpleSelectedRole, setSimpleSelectedRole] = useState("participant");

  const [customFieldValues, setCustomFieldValues] = useState(props.customFields);

  const [savedMessage, setSavedMessage] = useState(false);

  function availableRoles() {
    const disableCreateRoles = chain(organizations)
      .flatMap((g) => g.disableCreateRoles)
      .uniq()
      .value();

    return Roles.filter((role) => {
      // Roles that are always on are not selectable here
      if (role.preset) {
        return false;
      }

      if (isNew)
        if (disableCreateRoles.includes(role.type)) {
          return false;
        }

      return true;
    });
  }

  function hasRole(members: CourseMemberEntity[] | undefined, role: string) {
    return members && hasRoleUser(members, role, user?._id);
  }

  const [roles, setRoles] = useState<
    Record<string, { icon: string; enabled: boolean; enroll: boolean }>
  >({});

  useEffect(() => {
    setRoles(
      fromPairs(
        availableRoles().map((r) => [
          r.type,
          {
            icon: r.icon,
            enabled: props.roles?.includes(r.type) || false,
            enroll: hasRole(props.members, r.type) || false,
          },
        ]),
      ),
    );
  }, [organizations]);

  const [errors, checkValidity, addError] = useValidation(
    {
      noTitle: {
        field: "title",
        onCheckValidity: () => StringTools.sanitizeSingleline(title).length > 0,
        text: () => t("course.edit.error.title", "Please provide a title"),
      },
      descriptionToLong: {
        field: "description",
        onCheckValidity: () =>
          !PublicSettings.courseDescriptionMax ||
          numberOfCharacters <= PublicSettings.courseDescriptionMax,
        text: () =>
          t("_inputField.maxlength", {
            MAXNUMBER: PublicSettings.courseDescriptionMax,
            NUMBER: numberOfCharacters - (PublicSettings.courseDescriptionMax || 0),
          }),
      },
      noRegion: {
        field: "region",
        onCheckValidity: () => !!selectedRegion,
        text: () => t("course.edit.error.region", "Please select a region"),
      },
    },
    { autoCheckFixed: true },
  );

  useEffect(() => {
    checkValidity("description");
  }, [description]);

  function showRegionSelection() {
    return (
      // Region can be set for new courses only.
      isNew &&
      // For the proposal frame we hide the region selection when a region is
      // set.
      !(props.isFrame && props.region) &&
      // if the session sets the region we hide the region selection
      !currentRegion &&
      // If there is only one region on this instance or it is visible to this
      // user, it will be set automatically.
      regions.length > 1
    );
  }

  const customFields = () => {
    return organizations.flatMap((g) => g.customCourseFields || []);
  };

  const resetFields = () => {
    setTitle("");
    setDescription("");
    setSelectedCategories([]);
    setSimpleSelectedRole("participant");
    resetFocusTime();
  };

  useEffect(() => {
    // Show category selection right away for new courses
    setEditingCategories(isNew);
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
  function editBodyClasses() {
    const classes: string[] = [];

    if (props.isFrame) {
      classes.push("is-frame");
    }

    return classes.join(" ");
  }
  function courseEditRolesAttr(): CourseEditRoleProps[] {
    return Object.entries(roles).map((r) => {
      const type = r[0];
      return {
        type,
        ...r[1],
        onRole(checked: boolean) {
          const newRoles = { ...roles };
          newRoles[type] = {
            ...r[1],
            enabled: checked,
          };
          setRoles(newRoles);
        },
        onEnroll(checked: boolean) {
          const newRoles = { ...roles };
          newRoles[type] = {
            ...r[1],
            enroll: checked,
          };
          setRoles(newRoles);
        },
      };
    });
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

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
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
    } as unknown as Required<CoursesMethods.SaveFields>;

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

      changes.groups = getOrganizations();
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

      const courseId = await CoursesMethods.save(props._id || "", changes);

      Analytics.trackEvent(
        "Course creations",
        `Course creations as ${changes.subs.length > 0 ? changes.subs.sort().join(" and ") : "participant"}`,
        Regions.findOne(changes.region)?.nameEn,
        totalFocusTime(),
      );

      if (props.isFrame) {
        setSavedCourseId(courseId);
        setSavedMessage(true);
        resetFields();
      } else {
        if (isNew) {
          Router.go("showCourse", { _id: courseId }, { query: { nextActions: "1" } });
        } else {
          Alert.success(
            t("message.courseChangesSaved", "Your changes to {NAME} have been saved.", {
              NAME: changes.name,
            }),
          );
          Router.go("showCourse", { _id: courseId });
        }
      }
    } catch (err) {
      if (!addError(err.reason)) {
        // unknown error
        Alert.serverError(err, t("message.courseChangesSaved.error", "Saving went wrong"));
      }
    } finally {
      setIsBusy(false);
    }
  }

  function handleCancel() {
    const course = props;

    if (course._id) {
      Router.go("showCourse", course);
    } else {
      Router.go("home");
    }
  }

  if (regionsIsLoading() || organizationsIsLoading()) {
    return null;
  }

  return (
    <div className="edit-page">
      <form noValidate onSubmit={handleSave}>
        {props.coursesQuery ? (
          <FindHeader {...props} coursesQuery={props.coursesQuery} />
        ) : (
          <Header {...props} />
        )}
        <div className={`edit-page-body course-edit-body ${editBodyClasses()}`}>
          {!isNew && !!props.region && <Tag region={props.region} />}
          {showSavedMessage() && !!savedCourseId && (
            <AlertMessage
              isFrame={props.isFrame}
              savedCourseId={savedCourseId}
              onClose={() => setSavedMessage(false)}
            />
          )}

          {simpleRoleSelection && (
            <div className="mb-3">
              <label className="form-label" id="learnOrTeachTitle">
                {t("course.edit.learnOrTeach", "Learn or teach?")}
              </label>
              <div
                className="btn-group-toggle row"
                role="group"
                aria-labelledby="learnOrTeachTitle"
              >
                <div className="col d-grid">
                  <label className={`btn btn-lg ${simpleRoleActiveClass("participant")}`}>
                    <input
                      className="d-none"
                      type="radio"
                      name="role"
                      value="participant"
                      checked={simpleSelectedRole === "participant"}
                      onChange={handleRoleChange}
                    />
                    <i className="fa-solid fa-user fa-lg fa-fw" />{" "}
                    {t("course.edit.iWantToLearn", "I want to learn")}
                  </label>
                </div>
                <div className="col d-grid">
                  <label className={`btn btn-lg ${simpleRoleActiveClass("mentor")}`}>
                    <input
                      className="d-none"
                      type="radio"
                      name="role"
                      value="mentor"
                      checked={simpleSelectedRole === "mentor"}
                      onChange={handleRoleChange}
                    />
                    <i className="fa-solid fa-graduation-cap fa-lg fa-fw" />{" "}
                    {t("course.edit.iCanTeach", "I can teach")}
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
              id="course-edit-description"
              type="richtext"
              label={t("course.edit.description", "Description")}
              placeholder={t(
                "course.description.placeholder",
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
          {hasPricePolicy() && <PricePolicy dismissable={true} wrap="mb-3" />}
          <div className="row gap-3 mb-3">
            {!hideCategories() && (
              <div className="col-md">
                {editingCategories ? (
                  <SelectCategories {...selectCategoriesAttr()} />
                ) : (
                  <>
                    <div className="form-label">{t("course.edit.categories", "Categories")}</div>
                    {props.categories ? (
                      <CourseCategories categories={props.categories} />
                    ) : (
                      <div>{t("course.edit.no.categories", "No categories")}</div>
                    )}{" "}
                    <button
                      type="button"
                      className="btn btn-edit"
                      onClick={() => {
                        setEditingCategories(true);
                      }}
                    >
                      {t("course.edit.edit_categories")}
                    </button>
                  </>
                )}
              </div>
            )}

            {fullRoleSelection && availableRoles().length > 0 && (
              <div className="col-md">
                <div className="form-label">
                  {t("course.edit.needs.role", "This course might need…")}
                </div>
                {courseEditRolesAttr().map((courseEditRoleAttr) => (
                  <Role key={courseEditRoleAttr.type} {...courseEditRoleAttr} />
                ))}
              </div>
            )}
            {showMoreInfo() && (
              <div className="col-md">
                {showRegionSelection() && (
                  <div className="mb-3">
                    <RegionSelect
                      id="courses-edit-region-selection"
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

          {showInternalCheckbox() && (
            <div className="mb-3">
              <div className="form-label">{t("course.edit.intern", "Hide on front page")}</div>
              <FormCheck
                id="course-edit-internal"
                type="box"
                label={t(
                  "course.edit.internDescription",
                  "Only show when looking at a group's courses",
                )}
                checked={internal}
                onChange={(checked) => setInternal(checked)}
              />
            </div>
          )}

          <div className="form-actions">
            <ButtonSave submit id="courses-edit-save" isBusy={isBusy} />
            {!props.isFrame && (
              <ButtonCancel id="courses-edit-cancel" onClick={handleCancel} disabled={isBusy} />
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
