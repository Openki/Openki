import React from "react";
import { Router } from "meteor/iron:router";
import { ReactiveVar } from "meteor/reactive-var";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";
import { truncate } from "/imports/utils/string-tools";
import { textPlain } from "/imports/utils/html-tools";
import { useTranslation } from "react-i18next";

import { GroupModel, Groups } from "/imports/api/groups/groups";
import * as GroupsMethods from "/imports/api/groups/methods";
import { Regions } from "/imports/api/regions/regions";
import * as Alert from "/imports/api/alerts/alert";

import * as TemplateMixins from "/imports/ui/lib/template-mixins";
import { Store } from "/imports/ui/lib/editable";
import * as Analytics from "/imports/ui/lib/analytics";
import { i18n } from "/imports/startup/both/i18next";
import * as Metatags from "/imports/utils/metatags";
import { CourseTemplate } from "../../lib/course-template";
import { CleanedRegion } from "../../lib/cleaned-region";

import "/imports/ui/components/courses/find";
import { Editable } from "/imports/ui/components/editable/index.tsx";
import "/imports/ui/components/groups/settings";
import "/imports/ui/components/dashboard";
import { PleaseLogin } from "/imports/ui/components/please-login";
import type { Props as DashboardProps } from "/imports/ui/components/dashboard";

import "./styles.scss";
import { useUser } from "meteor/react-meteor-accounts";
import { ButtonCancel  } from "/imports/ui/components/buttons";

function allSet(group: {
  name: string | undefined;
  // short: string | undefined;
  // claim: string | undefined;
  // description: string | undefined;
}): group is {
  name: string;
  // short: string;
  // claim: string;
  // description: string;
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

  const user = useUser();

  const mayEdit = data.group.editableBy(user);

  function isFeatured() {
    const region = Regions.currentRegion();
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

  //function editableShort() {
  //   const instance = Template.instance();
  //   return mayEdit&& instance.editableShort;
  // }

  //  function hasContent() {
  //     const { group } = data;
  //     if (group.isNew()) {
  //       return true;
  //     }
  //     return group.claim || group.description;
  //   }
  //function editableClaim() {
  //   const instance = Template.instance();
  //   return mayEdit && instance.editableClaim;
  // }
  // function editableDescription() {
  //   const instance = Template.instance();
  //   return mayEdit && instance.editableDescription;
  // }

  //   function  editingSettings() {
  //     const { group } = data;
  //     return mayEdit&& !group.isNew() && instance.editingSettings.get();
  //   }
  //   function dashboardAttr(): DashboardProps {
  //     const { group } = data;

  //     const region = CleanedRegion(Session.get("region"));

  //     return {
  //       list: [
  //         {
  //           entity: "course",
  //           title: t("explore.recentActivities.title", "Recent activities"),
  //           query: `${region ? `region=${region}&` : ""}group=${group._id}`,
  //         },
  //         {
  //           entity: "event",
  //           title: t("explore.upcomingEvents.title", "Upcoming events"),
  //           query: `${region ? `region=${region}&` : ""}group=${
  //             group._id
  //           }&after=now&sort=start&internal=0&canceled=0`,
  //         },
  //         {
  //           entity: "course",
  //           title: t("explore.newProposals.title", "New proposals"),
  //           query: `${region ? `region=${region}&` : ""}group=${
  //             group._id
  //           }&state=proposal&internal=0&sort=time_created`,
  //         },
  //         {
  //           entity: "course",
  //           title: t("explore.lookingForMentors.title", "Looking for mentors"),
  //           query: `${region ? `region=${region}&` : ""}group=${
  //             group._id
  //           }&needsRole=mentor&state=proposal,resting&internal=0`,
  //         },
  //         {
  //           entity: "course",
  //           title: t("explore.lookingForVenues.title", "Looking for venues"),
  //           query: `${region ? `region=${region}&` : ""}group=${
  //             group._id
  //           }&needsRole=host&state=proposal,resting&internal=0`,
  //         },
  //         {
  //           entity: "eventsMap",
  //           title: t("explore.eventsMap.title", "Events map"),
  //           query: `${region ? `region=${region}&` : ""}group=${group._id}&after=now`,
  //         },
  //       ],
  //     };
  //   }
  //  function newCourse() {
  //     const { group } = data;
  //     const course = CourseTemplate();
  //     course.group = group._id;
  //     return course;
  //   }

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
    const group = {
      // name: instance.editableName.getEdited(),
      // short: instance.editableShort.getEdited(),
      // claim: instance.editableClaim.getEdited(),
      // description: instance.editableDescription.getEdited(),
    };

    // instance.errors.reset();

    // if (!allSet(group)) {
    //   instance.errors.add("emptyField");
    //   return;
    // }

    // instance.busy("saving");
    try {
      const groupId = await GroupsMethods.save("", group);

      // instance.editableName.end();
      // instance.editableShort.end();
      // instance.editableClaim.end();
      // instance.editableDescription.end();

      Alert.success(
        t("groupDetails.groupCreated", 'The "{GROUP}" group was created.', {
          GROUP: data.group.name,
        }),
      );

      Analytics.trackEvent("Group creations", "Group creations");

      Router.go("groupDetails", { _id: groupId });
    } catch (err) {
      Alert.serverError(err, t("groupDetails.saveError", { GROUP: data.group.name }));
    } finally {
      // instance.busy(false);
    }
  };

  const handleCancel = () => {
    Router.go("/"); // Got a better idea?
  };

  const showControls = !data.group.isNew();

  return (
    <>
      <div className="container mb-4">
        {/* {{#if group.isNew}}
      <h2>{{i18n 'group.details.titleNew' "Create new group"}}</h2>
    {{/if}} */}
        <div className="page-component group-details">
          <div className="group-details-titlebar clearfix">
            {t("group.details.group", "Group")}
            {/* {{#if isFeatured}}
          <i alt="{{i18n 'group.details.isFeatured' 'This group is featured' attr=true}}"
             aria-hidden="true" className="fa-solid fa-star fa-fw"></i>
        {{/if}} */}
            <button
              className="btn btn-link float-end ms-2 js-group-remove-filter"
              data-bs-toggle="tooltip"
              data-bs-title={t("group.page.removeFilter", "See all courses")}
            >
              <i className="fa-solid fa-xmark fa-lg" aria-hidden="true"></i>
            </button>
            {/* {{#unless group.isNew}}
          {{#if mayEdit}}
            <button className="btn btn-link float-end ms-2 js-group-settings" data-bs-toggle="tooltip"
                    data-bs-title="{{i18n 'group.settings.title' attr=true}}">
              <i className="fa-solid fa-gear fa-lg" aria-hidden="true"></i>
            </button>
          {{/if}}
        {{/unless}} */}
          </div>
          <div className={`details-header group-details-header clearfix ${headerClasses()}`}>
            {/* {{#if group.publicLogoUrl}}
          <div className="group-details-logo">
            <img src="{{group.publicLogoUrl}}">
          </div>
        {{/if}} */}
            <div className="group-details-name">
              {mayEdit ? (
                <Editable
                  text={data.group.name}
                  multiline={false}
                  placeholderText={t(
                    "group.name.placeholder",
                    "Name of your group, institution, community or program",
                  )}
                  maxlength={undefined}
                  store={
                    showControls
                      ? {
                          ...handleSaving,
                          onSave: async (newName) => {
                            await GroupsMethods.save(data.group._id, { name: newName });
                          },
                        }
                      : undefined
                  }
                />
              ) : (
                data.group.name
              )}
            </div>
            {/* <div className="group-details-short">
          {{#if editableShort}}
            {{> editable editableShort}}
          {{else}}
            ({{group.short}})
          {{/if}}
        </div> */}
          </div>
          {/* {{#if hasContent}}
        <div className="details-body group-details-body">
          <div className="details-content group-details-content {{errorClass 'all'}}">
            {{#if editableClaim}}
              <div className="group-details-claim">
                {{> editable editableClaim}}
              </div>
            {{else}}
              {{#if group.claim}}
                <div className="group-details-claim">
                  {{group.claim}}
                </div>
              {{/if}}
            {{/if}}
            {{#if editableDescription}}
              <div className="group-details-description is-editable">
                {{> editable editableDescription}}
              </div>
            {{else}}
              <div className="group-details-description">
                {{{group.description}}}
              </div>
            {{/if}}
            {{errorMessage 'all'}}
          </div>
        </div>
      {{/if}} */}
          {data.group.isNew() ? (
            <div className="actions">
              <PleaseLogin type="button" onClick={handleSave}>
                Save
              </PleaseLogin>
              <ButtonCancel onClick={handleCancel} />
            </div>
          ) : null}
          {/* {{#if editingSettings}}
        {{> groupSettings}}
      {{/if}} */}
        </div>
        {/* {{#unless PublicSettings.feature.groupDashboard}}
      {{#if showCourses}}
        {{> find courseQuery}}
      {{/if}}
    {{/unless}} */}
      </div>
      {/* {{#if PublicSettings.feature.groupDashboard}}
    {{#if showCourses}}
      {{> dashboard dashboardAttr}}
    {{/if}}
    <div className="container mw-md">
      {{> courseEdit newCourse}}
    </div>
  {{/if}} */}
    </>
  );
}

// const TemplateBase = TemplateAny as TemplateStaticTyped<
//   "groupDetailsPage",
//   Data,
//   {
//     mayEdit: ReactiveVar<boolean>;
//     editingSettings: ReactiveVar<boolean>;
//     // editableShort: Editable;
//     // editableClaim: Editable;
//     // editableDescription: Editable;
//   }
// >;

// const Template = TemplateMixins.FormfieldErrors(TemplateBase, "groupDetailsPage", {
//   emptyField: {
//     text: () => i18n("group.details.error.allMandatory", "All four fields are mandatory."),
//     field: "all",
//   },
// });

// const template = Template.groupDetailsPage;

// template.onCreated(function () {
//   const instance = this;

//   instance.busy(false);

//   instance.autorun(() => {
//     const data = Template.currentData();
//     const title = data.group.name || i18n("group.windowtitle.create", "Create group");
//     let description = "";
//     if (data.group.description) {
//       description = truncate(textPlain(data.group.claim), 160);
//     }
//     Metatags.setCommonTags(title, description, data.group.publicLogoUrl());
//   });

//   // const { group } = instance.data;
//   // const groupId = group._id;
//   instance.editingSettings = new ReactiveVar(false);

//   // instance.editableShort = new Editable(
//   //   false,
//   //   i18n("group.short.placeholder", "Abbreviation"),
//   //   undefined,
//   //   showControls
//   //     ? {
//   //         ...handleSaving,
//   //         onSave: async (newShort) => {
//   //           await GroupsMethods.save(groupId, { short: newShort });
//   //         },
//   //       }
//   //     : undefined,
//   // );

//   // instance.editableClaim = new Editable(
//   //   false,
//   //   i18n("group.claim.placeholder", "The core idea"),
//   //   undefined,
//   //   showControls
//   //     ? {
//   //         ...handleSaving,
//   //         onSave: async (newClaim) => {
//   //           await GroupsMethods.save(groupId, { claim: newClaim });
//   //         },
//   //       }
//   //     : undefined,
//   // );

//   // instance.editableDescription = new Editable(
//   //   true,
//   //   i18n(
//   //     "group.description.placeholder",
//   //     "Describe the audience, the interests and activities of your group.",
//   //   ),
//   //   undefined,
//   //   showControls
//   //     ? {
//   //         ...handleSaving,
//   //         onSave: async (newDescription) => {
//   //           await GroupsMethods.save(groupId, { description: newDescription });
//   //         },
//   //       }
//   //     : undefined,
//   // );

//   instance.autorun(() => {
//     // const currentGroup = Groups.findOne(groupId) || ({} as Partial<GroupModel>);
//     // instance.editableShort.setText(currentGroup.short || "");
//     // instance.editableClaim.setText(currentGroup.claim || "");
//     // instance.editableDescription.setText(currentGroup.description || "");
//   });
// });

// template.events({
//   "click .js-group-settings"(_event, instance) {
//     instance.editingSettings.set(!instance.editingSettings.get());
//   },

//   "click .js-group-remove-filter"() {
//     Router.go("/"); // Got a better idea?
//   },
// });


// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("GroupDetailsPage", () => GroupDetailsPage);
