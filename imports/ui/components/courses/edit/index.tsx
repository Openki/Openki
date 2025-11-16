import { Router } from "meteor/iron:router";
import React, { ChangeEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import chain from "lodash/chain";
import uniq from "lodash/uniq";
import fromPairs from "lodash/fromPairs";
import union from "lodash/union";

import * as Alert from "/imports/api/alerts/alert";
import { CourseMemberEntity, CourseModel, Courses, isPrivate } from "/imports/api/courses/courses";
import * as CoursesMethods from "/imports/api/courses/methods";
import { Regions } from "/imports/api/regions/regions";
import { Roles } from "/imports/api/roles/roles";

import { PublicSettings } from "/imports/utils/PublicSettings";
import { hasRoleUser } from "/imports/utils/course-role-utils";
import { getLocalizedValue } from "/imports/utils/getLocalizedValue";
import { useSiteName } from "/imports/utils/getSiteName";
import * as StringTools from "/imports/utils/string-tools";
import { useAccountTasks } from "/imports/utils/useAccountTasks";

import { Editable, Props as EditableProps } from "/imports/ui/components/editable";
import * as Analytics from "/imports/ui/lib/analytics";

import { ButtonCancel, ButtonSave } from "../../Buttons";
import { PricePolicy } from "../../price-policy";
import { Tag } from "../../regions/tag";
import { Props as CourseEditRoleProps, Role } from "./Role";
import { Title } from "./title";
import {
  useDetails as useCoursesDetails,
  useFindFilter as useCoursesFindFilter,
} from "/imports/api/courses/publications";
import { useDetails, useFindFilter as useGroupsFindFilter } from "/imports/api/groups/publications";
import { useAll as useRegionsAll } from "/imports/api/regions/publications";
import { useUser } from "/imports/utils/react-meteor-data";
import { useCurrentRegion } from "/imports/utils/useCurrentRegion";

import { EditCustomFields } from "../../EditCustomFields";
import { SelectCategories } from "../SelectCategories";
import { CourseCategories } from "../categories";
import { FormCheck } from "/imports/ui/components/FormCheck";
import { RegionSelect } from "/imports/ui/components/RegionSelect";

import "./styles.scss";

function GroupHeader({ groupId }: { groupId: string }) {
  const { t } = useTranslation();
  const [groupIsLoading, group] = useDetails(groupId);

  if (groupIsLoading()) {
    return null;
  }

  return (
    <>
      {t("course.edit.proposeInGroup", "Propose new course in group {GROUP}", {
        GROUP: group?.name,
      })}
    </>
  );
}

function Header(data: { _id?: string; isFrame?: boolean; group?: string }) {
  const { t } = useTranslation();
  const siteName = useSiteName();

  return data._id ? (
    <h2>{t("course.edit.edit_course", "Edit course")}</h2>
  ) : !data.isFrame ? (
    <>
      <h2>
        {data.group ? (
          <GroupHeader groupId={data.group} />
        ) : (
          t("course.edit.propose", "Propose new course")
        )}
      </h2>
      <div className="icon-text">
        <div className="icon-text-icon">
          <i className="fa-solid fa-info fa-fw" aria-hidden="true"></i>
        </div>
        <div className="icon-text-text">
          {t(
            "course.propose.CourseInfo",
            "Start your own {SITENAME} course here. Whether as a mentor or participant, you decide what and how you want to learn. More info here:",
            { SITENAME: siteName },
          )}{" "}
          <a
            href={getLocalizedValue(PublicSettings.courseGuideLink)}
            target="_blank"
            rel="noreferrer"
          >
            {t("course.propose.guideLink", "How to organize my first {SITENAME} course?", {
              SITENAME: siteName,
            })}
          </a>
          {", "}
          <a href={getLocalizedValue(PublicSettings.faqLink)} target="_blank" rel="noreferrer">
            {t("course.propose.faq", "FAQ")}
          </a>
        </div>
      </div>
    </>
  ) : null;
}

function FindHeader(data: {
  _id?: string;
  isFrame?: boolean;
  group?: string;
  filter: ReturnType<(typeof Courses)["Filtering"]>;
}) {
  const { t } = useTranslation();

  const { filter } = data;

  const filterQuery = filter.toQuery();
  const [coursesIsLoading, courses] = useCoursesFindFilter(filterQuery);

  function proposeFromQuery() {
    const { search } = filterQuery;
    if (!search) {
      return false;
    }

    return courses.length === 0 && search;
  }
  function courseSearch() {
    const filterParams = filter.toParams();

    return filterParams.search;
  }

  if (coursesIsLoading()) {
    return null;
  }

  return proposeFromQuery() ? (
    <h2>
      {t("find.propose_new_course?", 'Why not propose a new course for "{TERM}"?', {
        TERM: courseSearch(),
      })}
    </h2>
  ) : (
    <Header {...data} />
  );
}

function AlertMessage(data: {
  isFrame?: boolean | undefined;
  savedCourseId: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const siteName = useSiteName();
  const [savedCourseIsLoading, savedCourse] = useCoursesDetails(data.savedCourseId);

  function savedCourseLink() {
    if (data.isFrame) {
      const course = savedCourse;
      if (course) {
        return Router.url("showCourse", course);
      }
    }
    return "";
  }
  function savedCourseName() {
    if (data.isFrame) {
      const course = savedCourse;
      if (course) {
        return course.name;
      }
    }
    return false;
  }

  if (savedCourseIsLoading()) {
    return null;
  }

  return (
    <div className="alert alert-success alert-dismissible fade show" role="alert">
      <h4>
        <i className="fa-solid fa-check" aria-hidden="true"></i>{" "}
        {t("course.edit.savedMessage", "Your proposal has been saved!")}
      </h4>
      <span className="pre-line">
        {t("course.edit.linkToCourse", 'You can see your new proposal "{NAME}" on {SITENAME}', {
          NAME: (
            <a className="alert-link" href={savedCourseLink()} target="_blank" rel="noreferrer">
              {savedCourseName()}
            </a>
          ),
          SITENAME: siteName,
        })}
      </span>
      <button
        type="button"
        className="btn-close btn-close-black"
        data-bs-dismiss="alert"
        aria-label={t("_button.close")}
        onClick={data.onClose}
      ></button>
    </div>
  );
}

export type Props = {
  _id?: string;
  categories?: string[];
  isFrame?: boolean;
  group?: string;
  teamGroups?: string[];
  hideRoleSelection?: boolean;
  hidePricePolicy?: boolean;
  roles?: string[];
  creatorsRoles?: string[];
  singleEvent?: boolean;
  hideCategories?: boolean;
  internal?: boolean;
  filter?: ReturnType<(typeof Courses)["Filtering"]>;
} & Partial<CourseModel>;

export function Edit(props: Props) {
  const { t } = useTranslation();
  const user = useUser();
  const [allRegionsIsLoading, allRegions] = useRegionsAll();
  const currentRegion = useCurrentRegion();
  const [isBusy, setIsBusy] = useState(false);
  const [title, setTitle] = useState(props.name);

  const { adjustLoginModalPosition, promptToLogin } = useAccountTasks();

  function showInternalCheckbox() {
    let internalOption;

    if (!props.isFrame && props.group && user?.groups) {
      // Visible in group detail page (for creation) if user is in group
      internalOption = user.groups.includes(props.group);
    } else {
      // and visible on edit if course is in a group
      // For devs: This behaviour is not consistent. But we want the creation to be as simple
      // as possible.
      internalOption = (props.groups?.length || 0) > 0;
    }
    return internalOption;
  }

  const hasTeamGroups = !!(props.teamGroups && props.teamGroups?.length > 0);

  let internalInitalState;
  if (showInternalCheckbox()) {
    // Usually an "internal" checkbox is displayed so that the users of a group can choose
    // whether the course is internal or not.
    internalInitalState = props.internal;
  } else if (props.isFrame && hasTeamGroups) {
    // When in a frame for a group, the `internal` query-param can be set to control whether
    // the group wants the entered courses to be internal.
    internalInitalState = props.internal;
  }
  // Default is not internal
  internalInitalState = internalInitalState || false;

  const [internal, setInternal] = useState(internalInitalState);

  useEffect(() => {
    setTitle(props.name);
  }, [props.name]);

  function getRegion() {
    const courseId = props._id || "";
    const isNew = courseId === "";
    if (isNew) {
      if (props.isFrame && props.region) {
        // The region was preset for the frame
        return allRegions.find((r) => r._id === props.region);
      }
      if (allRegions.length === 1) {
        // There is only one region
        return allRegions[0];
      }
      return currentRegion;
    }
    return undefined;
  }
  const getGroups = () => {
    const groups = [];

    const defaultTeamGroups = getRegion()?.defaultTeamGroups;
    if (defaultTeamGroups) {
      groups.push(...defaultTeamGroups);
    }

    if (props && props._id /* is not new */) {
      groups.push(...(props.groupOrganizers || []));
    } else if (!props.isFrame) {
      if (props.group) {
        groups.push(props.group);
      }
    } else if (props.teamGroups && props.teamGroups?.length > 0) {
      groups.push(...props.teamGroups);
    }
    // remove double groups
    return uniq(groups);
  };
  const [savedCourseId, setSavedCourseId] = useState<string | undefined>(undefined);

  const [groupsIsLoading, groups] = useGroupsFindFilter({ ids: getGroups() });

  const [selectedRegion, setSelectedRegion] = useState(currentRegion?._id || "");

  const [description, setDescription] = useState(props.description);
  const [numberOfCharacters, setNumberOfCharacters] = useState(0);
  const [totalFocusTimeInSeconds, setTotalFocusTimeInSeconds] = useState(0);
  const editableDescription: EditableProps = {
    text: description,
    multiline: true,
    placeholder: t(
      "course.description.placeholder",
      "Describe your idea, so more people find it and know what to expect.",
    ),
    maxlength: PublicSettings.courseDescriptionMax,
    onChange: (newDescription, newNumberOfCharacters, newTotalFocusTimeInSeconds) => {
      setDescription(newDescription);
      setNumberOfCharacters(newNumberOfCharacters);
      setTotalFocusTimeInSeconds(newTotalFocusTimeInSeconds);
    },
  };

  const [editingCategories, setEditingCategories] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [fullRoleSelection, setFullRoleSelection] = useState(true);
  // For iframes: On true shows a simple role selection like: [I want to learn] [I can teach]
  const [simpleRoleSelection, setSimpleRoleSelection] = useState(false);
  // For iframes: Keep state of simple role selection
  const [simpleSelectedRole, setSimpleSelectedRole] = useState("participant");

  const [savedMessage, setSavedMessage] = useState(false);

  function availableRoles() {
    const disableCreateRoles = chain(groups)
      .flatMap((g) => g.disableCreateRoles)
      .uniq()
      .value();

    return Roles.filter((role) => {
      // Roles that are always on are not selectable here
      if (role.preset) {
        return false;
      }

      if (props && !props._id /* is new */)
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

  const groupsAreLoaded = groupsIsLoading();

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
  }, [groupsAreLoaded]);

  const showRegionSelection = () => {
    return (
      // Region can be set for new courses only.
      !props._id &&
      // For the proposal frame we hide the region selection when a region
      // is set.
      !(props.region && props.isFrame) &&
      // If there is only one region on this instance or it is visible to this user, it
      // will be set automatically.
      !(allRegions.length === 1)
    );
  };

  const customFields = (type?: "singleLine" | "multiLine" | "boolean") => {
    return (
      groups
        .flatMap((g) => g.customCourseFields || [])
        // when type is undefined all will get back
        .filter((g) => !type || (g.type || "singleLine") === type)
    );
  };

  const resetFields = () => {
    setTitle("");
    setDescription("");
    setSelectedCategories([]);
    setSimpleSelectedRole("participant");
  };

  useEffect(() => {
    // Show category selection right away for new courses
    setEditingCategories(!props._id);
    setSelectedCategories(props.categories || []);

    if (props.isFrame) {
      // When we're in the propose frame, show a simplified role selection
      setSimpleRoleSelection(!props.hideRoleSelection && !!props.roles?.includes("mentor"));
      setFullRoleSelection(false);
    }
  }, [props._id, props.categories, props.isFrame, props.hideRoleSelection, props.roles]);

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

    if (props.isFrame && props.region) {
      // The region was preset for the frame
      const region = allRegions.find((r) => r._id === props.region);
      if (region) {
        return !region.isPrivate();
      }
    }

    return !currentRegion?.isPrivate();
  }

  if (allRegionsIsLoading()) {
    return null;
  }

  const handleRoleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSimpleSelectedRole(event.target.value);
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const changes = {
      internal,
      name: StringTools.sanitizeSingleline(title),
      categories: selectedCategories || [],
    } as unknown as Required<CoursesMethods.SaveFields>;

    if (changes.name.length === 0) {
      Alert.serverError(t("course.edit.error.title", "Please provide a title") as string);
      return;
    }

    const newDescription = description;
    if (newDescription) {
      changes.description = newDescription;
    }

    if (PublicSettings.courseDescriptionMax && numberOfCharacters) {
      if (numberOfCharacters > PublicSettings.courseDescriptionMax) {
        Alert.error(
          t("_inputField.maxlength", {
            MAXNUMBER: PublicSettings.courseDescriptionMax,
            NUMBER: numberOfCharacters - PublicSettings.courseDescriptionMax,
          }),
        );
        return;
      }
    }

    let courseId = props._id || "";
    const isNew = courseId === "";
    if (isNew) {
      if (props.isFrame && props.region) {
        // The region was preset for the frame
        changes.region = props.region;
      } else if (Regions.findFilter({}, 2).count() === 1) {
        // There is only one region
        changes.region = Regions.findOne({})?._id as string;
      } else {
        changes.region = selectedRegion;
      }
      if (!changes.region) {
        Alert.serverError(t("course.edit.error.region", "Please select a region") as string);
        return;
      }

      if (props.singleEvent !== undefined) {
        changes.singleEvent = props.singleEvent;
      } else {
        const singleEvent = Regions.findOne({ _id: changes.region })?.singleEvents;

        if (singleEvent !== undefined) {
          changes.singleEvent = singleEvent;
        }
      }

      changes.groups = getGroups();
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

    changes.customFields = customFields().map((i) => {
      if (i.type !== "boolean")
        return {
          name: i.name,
          displayText: i.displayText,
          value: $(`.js-custom-field-${i.name}`).val() as string,
          visibleFor: i.visibleFor,
        };

      return {
        name: i.name,
        displayText: i.displayText,
        value: $(`.js-custom-field-${i.name}`).prop("checked") as boolean,
        visibleFor: i.visibleFor,
      };
    });

    setIsBusy(true);
    try {
      adjustLoginModalPosition(event.nativeEvent);
      if (!(await promptToLogin())) {
        return;
      }

      courseId = await CoursesMethods.save(courseId, changes);

      Analytics.trackEvent(
        "Course creations",
        `Course creations as ${
          changes.subs.length > 0 ? changes.subs.sort().join(" and ") : "participant"
        }`,
        Regions.findOne(changes.region)?.nameEn,
        totalFocusTimeInSeconds,
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
      Alert.serverError(err, t("message.courseChangesSaved.error", "Saving went wrong"));
    } finally {
      setIsBusy(false);
    }
  };

  const handleCancel = () => {
    const course = props;

    if (course._id) {
      Router.go("showCourse", course);
    } else {
      Router.go("home");
    }
  };

  if (groupsAreLoaded) {
    return null;
  }

  return (
    <div className="edit-page">
      <form noValidate onSubmit={handleSave}>
        {props.filter ? (
          <FindHeader {...{ ...props, filter: props.filter }} />
        ) : (
          <Header {...props} />
        )}
        <div className={`edit-page-body course-edit-body ${editBodyClasses()}`}>
          {!!props._id && !!props.region && <Tag region={props.region} />}
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
                    <i className="fa-solid fa-user fa-lg fa-fw"></i>{" "}
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
            showOtherProposals={!props._id}
          />
          <div className="mb-3">
            <label className="form-label">{t("course.edit.description", "Description")}</label>
            <Editable {...editableDescription} />
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
                <label className="form-label">
                  {t("course.edit.needs.role", "This course might need…")}
                </label>
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
                    />
                  </div>
                )}

                <EditCustomFields fields={customFields("boolean")} values={props.customFields} />

                <EditCustomFields fields={customFields("singleLine")} values={props.customFields} />
              </div>
            )}
          </div>
          <EditCustomFields fields={customFields("multiLine")} values={props.customFields} />

          {showInternalCheckbox() && (
            <div className="mb-3">
              <div className="form-label">{t("course.edit.intern", "Hide on front page")}</div>
              <FormCheck
                id="course-edit-internal"
                type="switch"
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
