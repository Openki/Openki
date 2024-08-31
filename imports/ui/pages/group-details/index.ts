import { Router } from "meteor/iron:router";
import { Meteor } from "meteor/meteor";
import { ReactiveVar } from "meteor/reactive-var";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";
import { truncate } from "/imports/utils/string-tools";
import { textPlain } from "/imports/utils/html-tools";

import { GroupModel, Groups } from "/imports/api/groups/groups";
import * as GroupsMethods from "/imports/api/groups/methods";
import { Regions } from "/imports/api/regions/regions";
import * as Alert from "/imports/api/alerts/alert";

import * as TemplateMixins from "/imports/ui/lib/template-mixins";
import { Store, Editable } from "/imports/ui/lib/editable";
import { PleaseLogin } from "/imports/ui/lib/please-login";
import * as Analytics from "/imports/ui/lib/analytics";
import { i18n } from "/imports/startup/both/i18next";
import * as Metatags from "/imports/utils/metatags";
import { CourseTemplate } from "../../lib/course-template";
import { CleanedRegion } from "../../lib/cleaned-region";

import "/imports/ui/components/courses/find";
import "/imports/ui/components/buttons";
import "/imports/ui/components/editable";
import "/imports/ui/components/groups/settings";
import "/imports/ui/components/dashboard";
import type { Props as DashboardProps } from "/imports/ui/components/dashboard";

import "./template.html";
import "./styles.scss";

export type Data = {
  courseQuery: Record<string, string | undefined> & {
    group: string;
    region: string | undefined;
  };
  group: GroupModel;
  showCourses: boolean;
};

const TemplateBase = TemplateAny as TemplateStaticTyped<
  "groupDetailsPage",
  Data,
  {
    mayEdit: ReactiveVar<boolean>;
    editingSettings: ReactiveVar<boolean>;
    editableName: Editable;
    editableShort: Editable;
    editableClaim: Editable;
    editableDescription: Editable;
  }
>;

const Template = TemplateMixins.FormfieldErrors(TemplateBase, "groupDetailsPage", {
  emptyField: {
    text: () => i18n("group.details.error.allMandatory", "All four fields are mandatory."),
    field: "all",
  },
});

const template = Template.groupDetailsPage;

template.onCreated(function () {
  const instance = this;

  instance.busy(false);

  instance.autorun(() => {
    const data = Template.currentData();
    const title = data.group.name || i18n("group.windowtitle.create", "Create group");
    let description = "";
    if (data.group.description) {
      description = truncate(textPlain(data.group.claim), 160);
    }
    Metatags.setCommonTags(title, description, data.group.publicLogoUrl());
  });

  const { group } = instance.data;
  const groupId = group._id;
  instance.mayEdit = new ReactiveVar(false);
  instance.editingSettings = new ReactiveVar(false);

  const handleSaving: Store = {
    clientValidations: {
      all: {
        check: (text) => !!text,
        errorMessage: () => i18n("group.details.error.allMandatory"),
      },
    },
    onSuccess: () => {
      Alert.success(
        i18n("groupDetails.changesSaved", 'Changes to the "{GROUP}" group have been saved.', {
          GROUP: group?.name,
        }),
      );
    },
    onError: (err) => {
      Alert.serverError(
        err as string | Error,
        i18n("groupDetails.saveError", 'Could not save the "{GROUP}" group', {
          GROUP: group?.name,
        }),
      );
    },
  };

  const showControls = !this.data.group.isNew();

  instance.editableName = new Editable(
    false,
    i18n("group.name.placeholder", "Name of your group, institution, community or program"),
    undefined,
    showControls
      ? {
          ...handleSaving,
          onSave: async (newName) => {
            await GroupsMethods.save(groupId, { name: newName });
          },
        }
      : undefined,
  );

  instance.editableShort = new Editable(
    false,
    i18n("group.short.placeholder", "Abbreviation"),
    undefined,
    showControls
      ? {
          ...handleSaving,
          onSave: async (newShort) => {
            await GroupsMethods.save(groupId, { short: newShort });
          },
        }
      : undefined,
  );

  instance.editableClaim = new Editable(
    false,
    i18n("group.claim.placeholder", "The core idea"),
    undefined,
    showControls
      ? {
          ...handleSaving,
          onSave: async (newClaim) => {
            await GroupsMethods.save(groupId, { claim: newClaim });
          },
        }
      : undefined,
  );

  instance.editableDescription = new Editable(
    true,
    i18n(
      "group.description.placeholder",
      "Describe the audience, the interests and activities of your group.",
    ),
    undefined,
    showControls
      ? {
          ...handleSaving,
          onSave: async (newDescription) => {
            await GroupsMethods.save(groupId, { description: newDescription });
          },
        }
      : undefined,
  );

  instance.autorun(() => {
    const data = Template.currentData();
    const currentGroup = Groups.findOne(groupId) || ({} as Partial<GroupModel>);
    const user = Meteor.user();
    const mayEdit = data.group.editableBy(user);
    instance.mayEdit.set(mayEdit);

    instance.editableName.setText(currentGroup.name || "");
    instance.editableShort.setText(currentGroup.short || "");
    instance.editableClaim.setText(currentGroup.claim || "");
    instance.editableDescription.setText(currentGroup.description || "");
  });
});

template.helpers({
  isFeatured() {
    const region = Regions.currentRegion();
    return (
      region &&
      !Template.instance().data.group.isNew() &&
      region.featuredGroup === Template.instance().data.group._id
    );
  },

  headerClasses() {
    const classes = [];
    if (Template.instance().data.group.logoUrl) {
      classes.push("has-logo");
    }
    if (Template.instance().mayEdit.get()) {
      classes.push("is-editable");
    }
    return classes.join(" ");
  },
  editableName() {
    const instance = Template.instance();
    return instance.mayEdit.get() && instance.editableName;
  },
  editableShort() {
    const instance = Template.instance();
    return instance.mayEdit.get() && instance.editableShort;
  },
  hasContent() {
    const { group } = Template.instance().data;
    if (group.isNew()) {
      return true;
    }
    return group.claim || group.description;
  },
  editableClaim() {
    const instance = Template.instance();
    return instance.mayEdit.get() && instance.editableClaim;
  },
  editableDescription() {
    const instance = Template.instance();
    return instance.mayEdit.get() && instance.editableDescription;
  },
  mayEdit() {
    const instance = Template.instance();
    return instance.mayEdit.get();
  },
  editingSettings() {
    const instance = Template.instance();
    const { group } = instance.data;
    return instance.mayEdit.get() && !group.isNew() && instance.editingSettings.get();
  },
  dashboardAttr(): DashboardProps {
    const instance = Template.instance();
    const { group } = instance.data;

    const region = CleanedRegion(Session.get("region"));

    return {
      region: region || "",
      group: group._id,
      list: [
        {
          entity: "course",
          title: "dashboard.recentActivities.title",
          query: "",
        },
        {
          entity: "event",
          title: "dashboard.upcomingEvents.title",
          query: `after=now&sort=start&internal=0&canceled=0`,
        },
        {
          entity: "course",
          title: "dashboard.newProposals.title",
          query: `state=proposal&internal=0&sort=-time_created`,
        },
        {
          entity: "course",
          title: "dashboard.lookingForMentors.title",
          query: `needsRole=mentor&state=proposal,resting&internal=0`,
        },
        {
          entity: "course",
          title: "dashboard.lookingForVenues.title",
          query: `needsRole=host&state=proposal,resting&internal=0`,
        },
        {
          entity: "eventsMap",
          title: "dashboard.eventsMap.title",
          query: `after=now`,
        },
      ],
    };
  },
  newCourse() {
    const instance = Template.instance();
    const { group } = instance.data;
    const course = CourseTemplate();
    course.group = group._id;
    return course;
  },
});

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

template.events({
  "click .js-group-settings"(_event, instance) {
    instance.editingSettings.set(!instance.editingSettings.get());
  },

  "click .js-group-save"(_event, instance) {
    const group = {
      name: instance.editableName.getEdited(),
      short: instance.editableShort.getEdited(),
      claim: instance.editableClaim.getEdited(),
      description: instance.editableDescription.getEdited(),
    };

    instance.errors.reset();

    if (!allSet(group)) {
      instance.errors.add("emptyField");
      return;
    }

    instance.busy("saving");
    PleaseLogin(instance, async () => {
      try {
        const groupId = await GroupsMethods.save("", group);

        instance.editableName.end();
        instance.editableShort.end();
        instance.editableClaim.end();
        instance.editableDescription.end();

        Alert.success(
          i18n("groupDetails.groupCreated", 'The "{GROUP}" group was created.', {
            GROUP: group.name,
          }),
        );

        Analytics.trackEvent("Group creations", "Group creations");

        Router.go("groupDetails", { _id: groupId });
      } catch (err) {
        Alert.serverError(err, i18n("groupDetails.saveError", { GROUP: group.name }));
      } finally {
        instance.busy(false);
      }
    });
  },

  "click .js-group-cancel"() {
    Router.go("/"); // Got a better idea?
  },

  "click .js-group-remove-filter"() {
    Router.go("/"); // Got a better idea?
  },
});
