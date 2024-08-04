import React, { useState } from "react";
import { Router } from "meteor/iron:router";
import { truncate } from "/imports/utils/string-tools";
import { textPlain } from "/imports/utils/html-tools";
import { useTranslation } from "react-i18next";
import { useValidation } from "../../lib/useValidation";
import { useUser } from "meteor/react-meteor-accounts";

import { GroupModel } from "/imports/api/groups/groups";
import * as GroupsMethods from "/imports/api/groups/methods";
import * as Alert from "/imports/api/alerts/alert";

import { Store } from "/imports/ui/lib/editable";
import * as Analytics from "/imports/ui/lib/analytics";
import * as Metatags from "/imports/utils/metatags";
// import { CourseTemplate } from "../../lib/course-template";
import { useCurrentRegion } from "/imports/utils/useCurrentRegion";

import { Editable, Props as EditableProps } from "/imports/ui/components/editable/index.tsx";

import { PublicSettings } from "/imports/utils/PublicSettings";
import { Dashboard, Props as DashboardProps } from "../../components/dashboard";
import { ButtonCancel, ButtonSave } from "/imports/ui/components/buttons";
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

export type Data = {
  courseQuery: Record<string, string | undefined> & {
    group: string;
    region: string | undefined;
  };
  group: GroupModel;
  showCourses: boolean;
};

export function GroupDetailsPage(data: Data) {
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

  const mayEdit = data.group.editableBy(user);

  function isFeatured() {
    return region && !data.group.isNew() && region.featuredGroup === data.group._id;
  }
  function headerClasses() {
    const classes = [];
    if (data.group.logoUrl) {
      classes.push("has-logo");
    }
    if (mayEdit) {
      classes.push("is-editable");
    }
    return classes.join(" ");
  }

  function allowEditingSettings() {
    const { group } = data;
    return mayEdit && !group.isNew() && editingSettings;
  }
  function dashboardAttr(): DashboardProps {
    const { group } = data;

    return {
      list: [
        {
          entity: "course",
          title: t("explore.recentActivities.title", "Recent activities"),
          query: `${region ? `region=${region._id}&` : ""}group=${group._id}`,
        },
        {
          entity: "event",
          title: t("explore.upcomingEvents.title", "Upcoming events"),
          query: `${region ? `region=${region._id}&` : ""}group=${
            group._id
          }&after=now&sort=start&internal=0&canceled=0`,
        },
        {
          entity: "course",
          title: t("explore.newProposals.title", "New proposals"),
          query: `${region ? `region=${region._id}&` : ""}group=${
            group._id
          }&state=proposal&internal=0&sort=time_created`,
        },
        {
          entity: "course",
          title: t("explore.lookingForMentors.title", "Looking for mentors"),
          query: `${region ? `region=${region._id}&` : ""}group=${
            group._id
          }&needsRole=mentor&state=proposal,resting&internal=0`,
        },
        {
          entity: "course",
          title: t("explore.lookingForVenues.title", "Looking for venues"),
          query: `${region ? `region=${region._id}&` : ""}group=${
            group._id
          }&needsRole=host&state=proposal,resting&internal=0`,
        },
        {
          entity: "eventsMap",
          title: t("explore.eventsMap.title", "Events map"),
          query: `${region ? `region=${region._id}&` : ""}group=${group._id}&after=now`,
        },
      ],
    };
  }
  // function newCourse() {
  //   const { group } = data;
  //   const course = CourseTemplate();
  //   course.group = group._id;
  //   return course;
  // }

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
          GROUP: data.group?.name,
        }),
      );
    },
    onError: (err) => {
      Alert.serverError(
        err as string | Error,
        t("groupDetails.saveError", 'Could not save the "{GROUP}" group', {
          GROUP: data.group?.name,
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

      Router.go("groupDetails", { _id: groupId });
    } catch (err) {
      Alert.serverError(err, t("groupDetails.saveError", { GROUP: newGroup.name }));
    } finally {
      setIsBusy(false);
    }
  };

  const handleCancel = () => {
    Router.go("profile"); // Got a better idea?
  };

  const showControls = !data.group.isNew();

  const editableNameAttr: EditableProps = {
    text: data.group.name,
    multiline: false,
    placeholderText: t(
      "group.name.placeholder",
      "Name of your group, institution, community or program",
    ),
    store: showControls
      ? {
          ...handleSaving,
          onSave: async (newName) => {
            await GroupsMethods.save(data.group._id, { name: newName });
          },
        }
      : undefined,
    onChange: (newName) => {
      setNewGroup({ ...newGroup, name: newName });
    },
  };

  const editableShortAttr: EditableProps = {
    text: data.group.short,
    multiline: false,
    placeholderText: t("group.short.placeholder", "Abbreviation"),
    store: showControls
      ? {
          ...handleSaving,
          onSave: async (newShort) => {
            await GroupsMethods.save(data.group._id, { short: newShort });
          },
        }
      : undefined,
    onChange: (newText) => {
      setNewGroup({ ...newGroup, short: newText });
    },
  };

  const editableClaimAttr: EditableProps = {
    text: data.group.claim,
    multiline: false,
    placeholderText: t("group.claim.placeholder", "The core idea"),
    store: showControls
      ? {
          ...handleSaving,
          onSave: async (newClaim) => {
            await GroupsMethods.save(data.group._id, { claim: newClaim });
          },
        }
      : undefined,
    onChange: (newClaim) => {
      setNewGroup({ ...newGroup, claim: newClaim });
    },
  };

  const editableDescriptionAttr: EditableProps = {
    text: data.group.description,
    multiline: true,
    placeholderText: t(
      "group.description.placeholder",
      "Describe the audience, the interests and activities of your group.",
    ),
    store: showControls
      ? {
          ...handleSaving,
          onSave: async (newDescription) => {
            await GroupsMethods.save(data.group._id, { description: newDescription });
          },
        }
      : undefined,
    onChange: (newDescription) => {
      setNewGroup({ ...newGroup, description: newDescription });
    },
  };

  const title = data.group.name || t("group.windowtitle.create", "Create group");
  let claim = "";
  if (data.group.claim) {
    claim = truncate(textPlain(data.group.claim), 160);
  }
  Metatags.setCommonTags(title, claim, data.group.publicLogoUrl());

  return (
    <>
      <div className="container mb-4">
        {data.group.isNew() ? <h2>{t("group.details.titleNew", "Create new group")}</h2> : null}
        <div className="page-component group-details">
          <div className="group-details-titlebar clearfix">
            {t("group.details.group", "Group")}

            {isFeatured() ? (
              <i
                title={t("group.details.isFeatured", "This group is featured")}
                aria-hidden="true"
                className="fa-solid fa-star fa-fw"
              ></i>
            ) : null}

            <button
              className="btn btn-link float-end ms-2"
              data-bs-toggle="tooltip"
              data-bs-title={t("group.page.removeFilter", "See all courses")}
              onClick={() => {
                Router.go("/"); // Got a better idea?
              }}
            >
              <i className="fa-solid fa-xmark fa-lg" aria-hidden="true"></i>
            </button>
            {!data.group.isNew() && mayEdit ? (
              <button
                className="btn btn-link float-end ms-2"
                data-bs-toggle="tooltip"
                data-bs-title={t("group.settings.title")}
                onClick={() => {
                  setEditingSettings(!editingSettings);
                }}
              >
                <i className="fa-solid fa-gear fa-lg" aria-hidden="true"></i>
              </button>
            ) : null}
          </div>
          <div className={`details-header group-details-header clearfix ${headerClasses()}`}>
            {data.group.publicLogoUrl() ? (
              <div className="group-details-logo">
                <img src={data.group.publicLogoUrl()} />
              </div>
            ) : null}
            <div className="group-details-name">
              {mayEdit ? <Editable {...editableNameAttr} /> : data.group.name}
            </div>
            <div className="group-details-short">
              {mayEdit ? <Editable {...editableShortAttr} /> : data.group.short}
            </div>
          </div>
          <div className="details-body group-details-body">
            <div
              className={`details-content group-details-content ${errors.all ? "has-error" : ""}`}
            >
              <div className="group-details-claim">
                {mayEdit ? <Editable {...editableClaimAttr} /> : data.group.claim}
              </div>

              <div className="group-details-description">
                {mayEdit ? <Editable {...editableDescriptionAttr} /> : data.group.description}
              </div>

              {errors.all ? <span className="form-text">{errors.all}</span> : null}
            </div>
          </div>
          {data.group.isNew() ? (
            <div className="actions">
              <ButtonSave onClick={handleSave} disabled={isBusy} />
              <ButtonCancel onClick={handleCancel} disabled={isBusy} />
            </div>
          ) : null}
          {allowEditingSettings() ? <GroupSettings group={data.group} /> : null}
        </div>
        {/* {{#unless PublicSettings.feature.groupDashboard}}
      {{#if showCourses}}
        {{> find courseQuery}}
      {{/if}}
    {{/unless}} */}
      </div>
      {PublicSettings.feature.groupDashboard && data.showCourses ? (
        <>
          <Dashboard {...dashboardAttr()} />
          {/*    <div className="container mw-md">
      {{> courseEdit newCourse}}
    </div>*/}
        </>
      ) : null}
    </>
  );
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("GroupDetailsPage", () => GroupDetailsPage);
