import { Router } from "meteor/iron:router";
import { i18n } from "/imports/startup/both/i18next";
import { ReactiveVar } from "meteor/reactive-var";
import { ReactiveDict } from "meteor/reactive-dict";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";
import { Meteor } from "meteor/meteor";

import * as Alert from "/imports/api/alerts/alert";
import { Course, CourseModel, Courses } from "/imports/api/courses/courses";
import * as CoursesMethods from "/imports/api/courses/methods";
import { GroupEntityCustomCourseFields, Groups } from "/imports/api/groups/groups";
import { Regions } from "/imports/api/regions/regions";
import { Roles } from "/imports/api/roles/roles";

import { PublicSettings } from "/imports/utils/PublicSettings";
import * as StringTools from "/imports/utils/string-tools";

import * as Analytics from "/imports/ui/lib/analytics";
import { Editable } from "/imports/ui/lib/editable";
import { PleaseLogin } from "/imports/ui/lib/please-login";

import "/imports/ui/components/buttons";
import "/imports/ui/components/courses/categories";
import "/imports/ui/components/courses/select-categories";
import "/imports/ui/components/editable";
import "/imports/ui/components/price-policy";
import "/imports/ui/components/regions/tag";
import "/imports/ui/components/edit-custom-fields";

import "./role";
import "./title";

import "./template.html";
import "./styles.scss";

export type Data = {
  _id?: string;
  categories: string[];
  isFrame?: boolean;
  group: string;
  teamGroups: string[];
  hideRoleSelection: boolean;
  hidePricePolicy: boolean;
  roles: string[];
  creatorsRoles: string[];
  singleEvent?: boolean;
} & Partial<CourseModel>;

const Template = TemplateAny as TemplateStaticTyped<
  "courseEdit",
  Data,
  {
    editableDescription: Editable;
    state: ReactiveDict<{
      editingCategories: boolean;
      selectedCategories: string[];
      fullRoleSelection: boolean;
      simpleRoleSelection: boolean;
      simpleSelectedRole: string;
    }>;
    savedCourseId: ReactiveVar<string | undefined>;
    showSavedMessage: ReactiveVar<boolean>;
    showRegionSelection: () => boolean;
    showInternalCheckbox: () => boolean;
    getSavedCourse: () => CourseModel | undefined;
    getGroups: () => string[];
    customFields: (
      type?: "singleLine" | "multiLine" | "boolean",
    ) => GroupEntityCustomCourseFields[];
    resetFields: () => void;
  }
>;

const template = Template.courseEdit;

template.onCreated(function () {
  const instance = this;

  instance.busy(false);

  instance.editableDescription = new Editable(
    true,
    i18n(
      "course.description.placeholder",
      "Describe your idea, so more people find it and know what to expect.",
    ),
    PublicSettings.courseDescriptionMax,
  );

  instance.state = new ReactiveDict();
  instance.state.setDefault({
    editingCategories: false,
    selectedCategories: [],
    fullRoleSelection: true,
    // For iframes: On true shows a simple role selection like: [I want to learn] [I can teach]
    simpleRoleSelection: false,
    // For iframes: Keep state of simple role selection
    simpleSelectedRole: "participant",
  });

  instance.savedCourseId = new ReactiveVar(undefined);
  instance.showSavedMessage = new ReactiveVar(false);

  function getRegion() {
    const data = Template.currentData();
    const courseId = data._id || "";
    const isNew = courseId === "";
    if (isNew) {
      if (data.isFrame && data.region) {
        // The region was preset for the frame
        return Regions.findOne({ _id: data.region });
      }
      if (Regions.findFilter({}, 2).count() === 1) {
        // There is only one region
        return Regions.findOne();
      }
      return Regions.currentRegion();
    }
    return undefined;
  }

  instance.getGroups = () => {
    const data = Template.currentData();
    const groups = [];

    const defaultTeamGroup = getRegion()?.defaultTeamGroup;
    if (defaultTeamGroup) {
      groups.push(defaultTeamGroup);
    }

    if (data && data instanceof Course && !(data as CourseModel).isNew()) {
      groups.push(...data.groupOrganizers);
    } else if (!data.isFrame) {
      if (data.group) {
        groups.push(data.group);
      }
    } else if (data.teamGroups?.length > 0) {
      groups.push(...data.teamGroups);
    }
    // remove double groups
    return [...new Set(groups)];
  };

  instance.autorun(() => {
    const data = Template.currentData();

    instance.editableDescription.setText(data.description || "");

    // Show category selection right away for new courses
    instance.state.set("editingCategories", !data._id);
    instance.state.set("selectedCategories", data.categories);

    instance.getGroups().forEach((g) => {
      instance.subscribe("group", g);
    });

    if (data.isFrame) {
      // When we're in the propose frame, show a simplified role selection
      instance.state.set(
        "simpleRoleSelection",
        !this.data.hideRoleSelection && this.data.roles.includes("mentor"),
      );
      instance.state.set("fullRoleSelection", false);

      const courseId = this.savedCourseId.get();
      if (courseId) {
        this.subscribe("courseDetails", courseId);
      }
    }
  });

  instance.showRegionSelection = () => {
    const data = Template.currentData();
    return (
      // Region can be set for new courses only.
      !data._id &&
      // For the proposal frame we hide the region selection when a region
      // is set.
      !(data.region && data.isFrame) &&
      // If there is only one region on this instance or it is visible to this user, it
      // will be set automatically.
      !(Regions.findFilter({}, 2).count() === 1)
    );
  };

  instance.showInternalCheckbox = () => {
    const data = Template.currentData();

    let internalOption;

    const user = Meteor.user();
    if (!data.isFrame && data.group && user?.groups) {
      // Visible in group detail page (for creation) if user is in group
      internalOption = user.groups.includes(data.group);
    } else {
      // and visible on edit if course is in a group
      // For devs: This behaviour is not consistent. But we want the creation to be as simple
      // as possible.
      internalOption = (data.groups?.length || 0) > 0;
    }
    return internalOption;
  };

  instance.getSavedCourse = () => Courses.findOne(instance.savedCourseId.get());

  instance.customFields = (type?: "singleLine" | "multiLine" | "boolean") => {
    const groups = instance.getGroups();

    return (
      Groups.find({ _id: { $in: groups } })
        .fetch()
        .flatMap((g) => g.customCourseFields || [])
        // when type is undefined all will get back
        .filter((g) => !type || (g.type || "singleLine") === type)
    );
  };

  instance.resetFields = () => {
    instance.$(".js-title").val("");
    instance.editableDescription.setText("");
    instance.state.set("selectedCategories", []);
    instance.state.set("simpleSelectedRole", "participant");
  };
});

template.helpers({
  simpleRoleActiveClass(role: string) {
    // HACK using btn-add and btn-edit to show activation state
    // It would be better to introduce own classes for this task.
    if (Template.instance().state.equals("simpleSelectedRole", role)) {
      return "btn-add active";
    }
    return "btn-edit";
  },

  availableRoles() {
    const courseId = Template.instance().data._id || "";
    const isNew = courseId === "";
    const groups = Template.instance().getGroups();

    const disableCreateRoles = [
      ...new Set(
        Groups.find({ _id: { $in: groups } })
          .fetch()
          .flatMap((g) => g.disableCreateRoles),
      ),
    ];

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
  },

  showMoreInfo() {
    return (
      Template.instance().showRegionSelection() || Template.instance().customFields().length > 0
    );
  },

  hideCategories() {
    return this.isFrame && this.hideCategories;
  },

  selectCategoriesAttr() {
    const instance = Template.instance();
    return {
      categories: instance.state.get("selectedCategories"),
      onChange: (selectedCategories: string[]) => {
        instance.state.set("selectedCategories", selectedCategories);
      },
    };
  },

  isInternal() {
    return this.internal ? "checked" : null;
  },

  proposeFromQuery() {
    const parentInstance = Template.instance().parentInstance() as any;
    const { filter } = parentInstance;
    if (!filter) {
      return false;
    }

    const filterQuery = filter.toQuery();

    const { search } = filterQuery;
    if (!search) {
      return false;
    }

    const results = Courses.findFilter(filterQuery, 1);

    return results.count() === 0 && search;
  },

  courseSearch() {
    const parentInstance = Template.instance().parentInstance() as any;
    const filterParams = parentInstance.filter.toParams();

    return filterParams.search;
  },

  newCourseGroupName() {
    if (this.group) {
      const groupId = this.group;
      const group = Groups.findOne(groupId);
      if (group) {
        return group.name;
      }
    }
    return false;
  },

  showSavedMessage() {
    if (Template.currentData().isFrame) {
      return Template.instance().showSavedMessage.get();
    }
    return false;
  },

  savedCourseLink() {
    if (Template.currentData().isFrame) {
      const course = Template.instance().getSavedCourse();
      if (course) {
        return Router.url("showCourse", course);
      }
    }
    return false;
  },

  savedCourseName() {
    if (Template.currentData().isFrame) {
      const course = Template.instance().getSavedCourse();
      if (course) {
        return course.name;
      }
    }
    return false;
  },

  editBodyClasses() {
    const classes = [];

    if (Template.currentData().isFrame) {
      classes.push("is-frame");
    }

    return classes.join(" ");
  },

  hasPricePolicy() {
    const { hidePricePolicy } = Template.currentData();
    const data = Template.currentData();

    if (hidePricePolicy) {
      return false;
    }

    if (data && data instanceof Course) {
      if (!(data as CourseModel).isNew()) {
        return !(data as CourseModel).isPrivate();
      }
    }

    if (data.isFrame && data.region) {
      // The region was preset for the frame
      const region = Regions.findOne(data.region);
      if (region) {
        return !region.isPrivate();
      }
    }

    return !Regions.currentRegion()?.isPrivate();
  },
});

template.events({
  "change input[name=role]"(_event, instance) {
    instance.state.set(
      "simpleSelectedRole",
      instance.$("input[name=role]:checked").val() as string,
    );
  },

  "click .js-close"(_event, instance) {
    instance.showSavedMessage.set(false);
  },

  "submit form, click .js-course-edit-save"(event, instance) {
    event.preventDefault();

    const data = Template.currentData();
    const hasTeamGroups = !!(data.teamGroups?.length > 0);

    let internal;
    if (instance.showInternalCheckbox()) {
      // Usually an "internal" checkbox is displayed so that the users of a group can choose
      // whether the course is internal or not.
      internal = instance.$(".js-check-internal").is(":checked");
    } else if (data.isFrame && hasTeamGroups) {
      // When in a frame for a group, the `internal` query-param can be set to control whether
      // the group wants the entered courses to be internal.
      internal = data.internal;
    }
    // Default is not internal
    internal = internal || false;

    const changes = {
      internal,
      name: StringTools.saneTitle(instance.$(".js-title").val() as string),
      categories: instance.state.get("selectedCategories") || [],
    } as unknown as Required<CoursesMethods.SaveFields>;

    if (changes.name.length === 0) {
      Alert.serverError(i18n("course.edit.error.title", "Please provide a title") as string);
      return;
    }

    const newDescription = instance.editableDescription.getEdited();
    if (newDescription) {
      changes.description = newDescription;
    }

    const numberOfCharacters = instance.editableDescription.getNumberOfCharacters();
    if (PublicSettings.courseDescriptionMax && numberOfCharacters) {
      if (numberOfCharacters > PublicSettings.courseDescriptionMax) {
        Alert.error(
          i18n("_inputField.maxlength", {
            MAXNUMBER: PublicSettings.courseDescriptionMax,
            NUMBER: numberOfCharacters - PublicSettings.courseDescriptionMax,
          }),
        );
        return;
      }
    }

    let courseId = data._id || "";
    const isNew = courseId === "";
    if (isNew) {
      if (data.isFrame && data.region) {
        // The region was preset for the frame
        changes.region = data.region;
      } else if (Regions.findFilter({}, 2).count() === 1) {
        // There is only one region
        changes.region = Regions.findOne({})?._id as string;
      } else {
        changes.region = instance.$(".js-select-region").val() as string;
      }
      if (!changes.region) {
        Alert.serverError(i18n("course.edit.error.region", "Please select a region") as string);
        return;
      }

      if (data.singleEvent !== undefined) {
        changes.singleEvent = data.singleEvent;
      } else {
        const singleEvent = Regions.findOne({ _id: changes.region })?.singleEvents;

        if (singleEvent !== undefined) {
          changes.singleEvent = singleEvent;
        }
      }

      changes.groups = instance.getGroups();
    }

    changes.roles = {};
    changes.subs = [];
    changes.unsubs = [];

    if (data.isFrame) {
      data.roles.forEach((role) => {
        changes.roles[role] = true;
      });

      if (
        instance.state.equals("simpleRoleSelection", true) &&
        instance.state.equals("simpleSelectedRole", "mentor")
      ) {
        changes.subs.push("mentor");
      }

      // Create unique, merged array
      changes.subs = [...new Set([...changes.subs, ...data.creatorsRoles])];
    }

    if (instance.state.equals("fullRoleSelection", true)) {
      instance.$(".js-check-role").each(function () {
        const inputElement = this as HTMLInputElement;
        changes.roles[inputElement.name] = inputElement.checked;
      });
      instance.$(".js-check-enroll").each(function () {
        const inputElement = this as HTMLInputElement;
        const role = inputElement.name;
        const subscribe = !!inputElement.checked;
        if (subscribe) {
          changes.subs.push(role);
        } else {
          changes.unsubs.push(role);
        }
      });
    }

    changes.customFields = instance.customFields().map((i) => {
      if (i.type !== "boolean")
        return {
          name: i.name,
          displayText: i.displayText,
          value: instance.$(`.js-custom-field-${i.name}`).val() as string,
          visibleFor: i.visibleFor,
        };

      return {
        name: i.name,
        displayText: i.displayText,
        value: instance.$(`.js-custom-field-${i.name}`).prop("checked") as boolean,
        visibleFor: i.visibleFor,
      };
    });

    instance.busy("saving");
    PleaseLogin(instance, async () => {
      try {
        courseId = await CoursesMethods.save(courseId, changes);

        if (instance.data.isFrame) {
          instance.savedCourseId.set(courseId);
          instance.showSavedMessage.set(true);
          instance.resetFields();

          Analytics.trackEvent(
            "Course creations",
            `Course creations as ${
              changes.subs.length > 0 ? changes.subs.sort().join(" and ") : "participant"
            }`,
            Regions.findOne(changes.region)?.nameEn,
            instance.editableDescription.getTotalFocusTimeInSeconds(),
          );
        } else {
          if (isNew) {
            Alert.successNextActions(
              i18n("message.courseCreated", "{NAME} has been created!", {
                NAME: changes.name,
              }),
              i18n("message.courseCreated.description", "What do you wanna do next?"),
              numberOfCharacters === 0
                ? {
                    text: i18n("message.courseCreated.addDescription", "Add a desciption"),
                    href: "#course-description",
                  }
                : undefined,
              { text: i18n("message.courseCreated.addImage", "Add a image"), href: "#files-tab" },
              { text: i18n("message.courseCreated.subscribe", "Subscribe"), href: "#subscribe" },
              Regions.findOne(changes.region)?.isPrivate()
                ? { text: i18n("message.courseCreated.share", "Share it"), href: "#share" }
                : undefined,

              {
                text: i18n("message.courseCreated.discussion", "Write a comment"),
                href: "#discussion",
              },
              { text: i18n("message.courseCreated.addEvent", "Add an event"), href: "#add-event" },
            );
            Analytics.trackEvent(
              "Course creations",
              `Course creations as ${
                changes.subs.length > 0 ? changes.subs.sort().join(" and ") : "participant"
              }`,
              Regions.findOne(changes.region)?.nameEn,
              instance.editableDescription.getTotalFocusTimeInSeconds(),
            );
          } else {
            Alert.success(
              i18n("message.courseChangesSaved", "Your changes to {NAME} have been saved.", {
                NAME: changes.name,
              }),
            );
          }

          Router.go("showCourse", { _id: courseId });
        }
      } catch (err) {
        Alert.serverError(err, i18n("message.courseChangesSaved.error", "Saving went wrong"));
      } finally {
        instance.busy(false);
      }
    });
  },

  "click .js-course-edit-cancel"(_event, instance) {
    const course = instance.data;

    if (course._id) {
      Router.go("showCourse", course);
    } else {
      Router.go("/");
    }
  },

  "click .js-edit-categories"() {
    Template.instance().state.set("editingCategories", true);
  },
});
