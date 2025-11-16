import truncate from "lodash/truncate";
import { Router } from "meteor/iron:router";
import { useUser } from "meteor/react-meteor-accounts";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useValidation } from "../../lib/useValidation";
import { textPlain } from "/imports/utils/html-tools";
import { PublicSettings } from "/imports/utils/PublicSettings";

import * as Alert from "/imports/api/alerts/alert";
import { GroupModel } from "/imports/api/groups/groups";
import * as GroupsMethods from "/imports/api/groups/methods";

import * as Analytics from "/imports/ui/lib/analytics";
import { Store } from "/imports/ui/lib/editable";
import * as Metatags from "/imports/utils/metatags";
import { useCurrentRegion } from "/imports/utils/useCurrentRegion";

import { Editable, Props as EditableProps } from "/imports/ui/components/editable";

import { ButtonCancel, ButtonSave } from "../../components/Buttons.old";
import { Find } from "../../components/courses/find";
import { Dashboard, Props as DashboardProps } from "../../components/dashboard";
import { VenueTag } from "../../components/venues/link";
import { GroupSettings } from "/imports/ui/components/groups/settings";

import "./styles.scss";

function allSet(group: {
  name: string | undefined;
  short: string | undefined;
  claim: string | undefined;
  description: string | undefined;
}): group is {
  name: string;
  short: string;
  claim: string;
  description: string;
} {
  return Object.values(group).every((u) => u);
}

export interface Data {
  courseQuery: Record<string, string | undefined> & {
    group: string;
    region: string | undefined;
  };
  group: GroupModel;
  showCourses: boolean;
}

export function GroupDetailsPage({ courseQuery, group, showCourses }: Data) {
  const { t } = useTranslation();
  const region = useCurrentRegion();
  const [editingSettings, setEditingSettings] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [errors, , addError, resetErrors] = useValidation({
    emptyField: {
      text: () => t("group.details.error.allMandatory", "All four fields are mandatory."),
      field: "all",
    },
  });
  const [newGroup, setNewGroup] = useState<{
    name: string | undefined;
    short: string | undefined;
    claim: string | undefined;
    description: string | undefined;
  }>({ name: undefined, short: undefined, claim: undefined, description: undefined });

  const user = useUser();

  const mayEdit = group.editableBy(user);

  function isFeatured() {
    return !!region && !group.isNew() && region.featuredGroup === group._id;
  }
  function headerClasses() {
    const classes = [];
    if (group.logoUrl) {
      classes.push("has-logo");
    }
    if (mayEdit) {
      classes.push("is-editable");
    }
    return classes.join(" ");
  }

  function allowEditingSettings() {
    return mayEdit && !group.isNew() && editingSettings;
  }
  function dashboardAttr(): DashboardProps {
    return {
      list: group.dashboard || PublicSettings.groupDashboardDefault || [],
      defaultRegion: region?._id || "",
      defaultGroup: group._id,
    };
  }

  const handleSaving: Store = {
    clientValidations: {
      all: {
        check: (text) => !!text,
        errorMessage: () => t("group.details.error.allMandatory"),
      },
    },
    onSuccess: () => {
      Alert.success(
        t("groupDetails.changesSaved", 'Changes to the "{GROUP}" group have been saved.', {
          GROUP: group.name,
        }),
      );
    },
    onError: (err) => {
      Alert.serverError(
        err as string | Error,
        t("groupDetails.saveError", 'Could not save the "{GROUP}" group', {
          GROUP: group.name,
        }),
      );
    },
  };

  const handleSave = async () => {
    resetErrors();

    if (!allSet(newGroup)) {
      addError("emptyField");
      return;
    }

    setIsBusy(true);
    try {
      const groupId = await GroupsMethods.save("", newGroup);

      Alert.success(
        t("groupDetails.groupCreated", 'The "{GROUP}" group was created.', {
          GROUP: newGroup.name,
        }),
      );

      Analytics.trackEvent("Group creations", "Group creations");

      Router.go("groupDetails", { _id: groupId, short: newGroup.short });
    } catch (err) {
      Alert.serverError(err, t("groupDetails.saveError", { GROUP: newGroup.name }));
    } finally {
      setIsBusy(false);
    }
  };

  const handleCancel = () => {
    Router.go("profile"); // Got a better idea?
  };

  const showControls = !group.isNew();

  const editableNameAttr: EditableProps = {
    text: group.name,
    multiline: false,
    placeholder: t(
      "group.name.placeholder",
      "Name of your group, institution, community or program",
    ),
    store: showControls
      ? {
          ...handleSaving,
          onSave: async (newName) => {
            await GroupsMethods.save(group._id, { name: newName });
          },
        }
      : undefined,
    onChange: (newName) => {
      setNewGroup((state) => ({ ...state, name: newName }));
    },
  };

  const editableShortAttr: EditableProps = {
    text: group.short,
    multiline: false,
    placeholder: t("group.short.placeholder", "Abbreviation"),
    store: showControls
      ? {
          ...handleSaving,
          onSave: async (newShort) => {
            await GroupsMethods.save(group._id, { short: newShort });
          },
        }
      : undefined,
    onChange: (newText) => {
      setNewGroup((state) => ({ ...state, short: newText }));
    },
  };

  const editableClaimAttr: EditableProps = {
    text: group.claim,
    multiline: false,
    placeholder: t("group.claim.placeholder", "The core idea"),
    store: showControls
      ? {
          ...handleSaving,
          onSave: async (newClaim) => {
            await GroupsMethods.save(group._id, { claim: newClaim });
          },
        }
      : undefined,
    onChange: (newClaim) => {
      setNewGroup((state) => ({ ...state, claim: newClaim }));
    },
  };

  const editableDescriptionAttr: EditableProps = {
    text: group.description,
    multiline: true,
    placeholder: t(
      "group.description.placeholder",
      "Describe the audience, the interests and activities of your group.",
    ),
    store: showControls
      ? {
          ...handleSaving,
          onSave: async (newDescription) => {
            await GroupsMethods.save(group._id, { description: newDescription });
          },
        }
      : undefined,
    onChange: (newDescription) => {
      setNewGroup((state) => ({ ...state, description: newDescription }));
    },
  };

  const title = group.name || t("group.windowtitle.create", "Create group");
  let claim = "";
  if (group.claim) {
    claim = truncate(textPlain(group.claim), { length: 160 });
  }
  Metatags.setCommonTags(title, claim, group.publicLogoUrl());

  return (
    <>
      <div className="container mb-4">
        {group.isNew() && <h2>{t("group.details.titleNew", "Create new group")}</h2>}
        <div className="page-component group-details">
          <div className="group-details-titlebar clearfix">
            {t("group.details.group", "Group")}

            {isFeatured() && (
              <>
                {" "}
                <i
                  title={t("group.details.isFeatured", "This group is featured")}
                  aria-hidden="true"
                  className="fa-solid fa-star fa-fw"
                ></i>
              </>
            )}

            <button
              className="btn btn-link float-end ms-2"
              data-bs-title={t("group.page.removeFilter", "See all courses")}
              onClick={() => {
                Router.go("home"); // Got a better idea?
              }}
            >
              <i className="fa-solid fa-xmark fa-lg" aria-hidden="true"></i>
            </button>
            {!group.isNew() && mayEdit && (
              <button
                className="btn btn-link float-end ms-2"
                data-bs-title={t("group.settings.title")}
                onClick={() => {
                  setEditingSettings(!editingSettings);
                }}
              >
                <i className="fa-solid fa-gear fa-lg" aria-hidden="true"></i>
              </button>
            )}
          </div>
          <div className={`details-header group-details-header clearfix ${headerClasses()}`}>
            {!!group.publicLogoUrl() && (
              <div className="group-details-logo">
                <img src={group.publicLogoUrl()} />
              </div>
            )}
            <div className="group-details-name">
              {mayEdit ? <Editable {...editableNameAttr} /> : group.name}
            </div>{" "}
            <div className="group-details-short">
              {mayEdit ? <Editable {...editableShortAttr} /> : group.short}
            </div>
          </div>
          <div className="details-body group-details-body">
            <div
              className={`details-content group-details-content ${errors.all ? "has-error" : ""}`}
            >
              <div className="group-details-claim">
                {mayEdit ? <Editable {...editableClaimAttr} /> : group.claim}
              </div>

              <div className="group-details-description">
                {mayEdit ? (
                  <Editable {...editableDescriptionAttr} />
                ) : (
                  <span dangerouslySetInnerHTML={{ __html: group.description }}></span>
                )}
              </div>

              {!!errors.all && <span className="form-text d-block">{errors.all}</span>}

              {!!(group.venues && group.venues.length > 0) && (
                <div className="group-details-venues">
                  {t("group.details.venues", "{NUM, plural, one{Venue:} other{Venues:} }", {
                    NUM: group.venues.length,
                  })}{" "}
                  <span className="tag-group">
                    {group.venues.map((v) => (
                      <VenueTag key={v._id} venue={v} />
                    ))}
                  </span>
                </div>
              )}
            </div>
          </div>
          {group.isNew() && (
            <div className="actions">
              <ButtonSave id="group-details-save" onClick={handleSave} disabled={isBusy} />
              <ButtonCancel id="group-details-cancel" onClick={handleCancel} disabled={isBusy} />
            </div>
          )}
          {allowEditingSettings() && <GroupSettings group={group} />}
        </div>
        {!dashboardAttr().list.length && showCourses && <Find query={courseQuery} />}
      </div>
      {!!dashboardAttr().list.length && showCourses && <Dashboard {...dashboardAttr()} />}
    </>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("GroupDetailsPage", () => GroupDetailsPage);
