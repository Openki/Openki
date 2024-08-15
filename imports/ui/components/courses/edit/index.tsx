import { Router } from "meteor/iron:router";
import { i18n } from "/imports/startup/both/i18next";
import { ReactiveVar } from "meteor/reactive-var";
import { ReactiveDict } from "meteor/reactive-dict";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";
import { Meteor } from "meteor/meteor";

import * as Alert from "/imports/api/alerts/alert";
import { Course, CourseMemberEntity, CourseModel, Courses } from "/imports/api/courses/courses";
import * as CoursesMethods from "/imports/api/courses/methods";
import { GroupEntityCustomCourseFields, Groups } from "/imports/api/groups/groups";
import { Regions } from "/imports/api/regions/regions";
import { Roles } from "/imports/api/roles/roles";

import { PublicSettings } from "/imports/utils/PublicSettings";
import * as StringTools from "/imports/utils/string-tools";
import { hasRoleUser } from "/imports/utils/course-role-utils";

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
import type { Props as CourseEditRoleProps } from "./role";
import "./title";

import "./styles.scss";

export function Edit(){
  return     <div class="edit-page">
  <form autocomplete="off">
    {{#if proposeFromQuery}}
      <h2>{{i18n 'find.propose_new_course?' 'Why not propose a new course for "{TERM}"?' TERM=(courseSearch)}}
      </h2>
    {{else}}
      {{#if _id}}
        <h2>{{i18n 'course.edit.edit_course' 'Edit course'}}</h2>
      {{else}}
        {{#unless isFrame}}
          <h2>
            {{#if newCourseGroupName}}
              {{i18n 'course.edit.proposeInGroup' 'Propose new course in group {GROUP}' GROUP=newCourseGroupName}}
            {{else}}
              {{i18n 'course.edit.propose' 'Propose new course'}}
            {{/if}}
          </h2>
          <div class="icon-text">
            <div class="icon-text-icon">
              <i class="fa-solid fa-info fa-fw" aria-hidden="true"></i>
            </div>
            <div class="icon-text-text">
              {{i18n 'course.propose.CourseInfo' 'Start your own {SITENAME} course here. Whether as a mentor or participant, you decide what and how you want to learn. More info here:' SITENAME=siteName}}
              <a href="{{localized PublicSettings.courseGuideLink}}" target='_blank'>
                {{i18n 'course.propose.guideLink' 'How to organize my first {SITENAME} course?' SITENAME=siteName}}
              </a>,
              <a href="{{localized PublicSettings.faqLink}}"
                 target="_blank">{{i18n 'course.propose.faq' 'FAQ'}}</a>
            </div>
          </div>
        {{/unless}}
      {{/if}}
    {{/if}}
    <div class="edit-page-body course-edit-body {{editBodyClasses}}">
      {{#if _id}}
        {{> regionTag this}}
      {{/if}}
      {{#if showSavedMessage}}
        <div class="alert alert-success alert-dismissible fade show" role="alert">
          <h4>
            <i class="fa-solid fa-check" aria-hidden="true"></i>
            {{i18n 'course.edit.savedMessage' 'Your proposal has been saved!'}}
          </h4>
          <a class="alert-link" href="{{savedCourseLink}}" target="_blank">
            {{i18n 'course.edit.linkToCourse' 'Click here to see your new "{NAME}" course on {SITENAME}' NAME=savedCourseName SITENAME=siteName}}
          </a>
          <button type="button" class="btn-close btn-close-white js-close"
                  data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
      {{/if}}
      {{#if (state 'simpleRoleSelection')}}
        <div class="mb-3">
          <label class="form-label"
                 id="learnOrTeachTitle">{{i18n 'course.edit.learnOrTeach' 'Learn or teach?'}}</label>
          <div class="btn-group-toggle row" role="group" aria-labelledby="learnOrTeachTitle">
            <div class="col d-grid">
              <label class="btn btn-lg {{simpleRoleActiveClass 'participant'}}">
                <input class="d-none" type="radio" name="role" value="participant" checked>
                <i class="fa-solid fa-user fa-lg fa-fw"></i>
                {{i18n 'course.edit.iWantToLearn' 'I want to learn'}}
              </label>
            </div>
            <div class="col d-grid">
              <label class="btn btn-lg {{simpleRoleActiveClass 'mentor'}}">
                <input class="d-none" type="radio" name="role" value="mentor">
                <i class="fa-solid fa-graduation-cap fa-lg fa-fw"></i>
                {{i18n 'course.edit.iCanTeach' 'I can teach'}}
              </label>
            </div>
          </div>
        </div>
      {{/if}}
      {{> courseTitle}}
      <div class="mb-3">
        <label class="form-label">{{i18n 'course.edit.description' 'Description'}}</label>
        {{> editable instance.editableDescription}}
      </div>
      {{#if hasPricePolicy}}
        {{> pricePolicy dismissable=true wrap='mb-3'}}
      {{/if}}
      <div class="row gap-3 mb-3">
        {{#unless hideCategories}}
          <div class="col-md">
            {{#if (state 'editingCategories')}}
              {{> selectCategories selectCategoriesAttr}}
            {{else}}
              <label class="form-label">{{i18n 'course.edit.categories' 'Categories'}}</label>
              {{#if categories}}
                {{> courseCategories categories=this.categories}}
              {{/if}}
              {{#unless categories}}
                <div>
                  {{i18n 'course.edit.no.categories' 'No categories'}}
                </div>
              {{/unless}}
              <button type="button" class="btn btn-edit js-edit-categories">
                {{i18n 'course.edit.edit_categories'}}
              </button>
            {{/if}}
          </div>
        {{/unless}}
        {{#if (state 'fullRoleSelection')}}
          <div class="col-md">
            <label
                   class="form-label">{{i18n 'course.edit.needs.role' 'This course might need…'}}</label>
            {{#each courseEditRoleAttr in courseEditRolesAttr}}
              {{> courseEditRole courseEditRoleAttr}}
            {{/each}}
          </div>
        {{/if}}
        {{#if showMoreInfo}}
          <div class="col-md">

            {{#if instance.showRegionSelection}}
              <div class="mb-3">
                <label class="form-label">{{i18n 'course.edit.region' 'Region'}}</label>
                <div class="input-group">
                  <div class="input-group-text">
                    <span class="fa-solid fa-location-dot" aria-hidden="true"></span>
                  </div>
                  <select class="js-select-region form-select" name='region'>
                    <option value='' disabled
                            selected="{{#if isCurrentRegion 'all'}}selected{{/if}}"
                            class="select-placeholder">
                      {{i18n '_selection.pleaseSelect'}}
                    </option>
                    {{#each region in regions}}
                      <option value='{{region._id}}'
                              selected="{{#if isCurrentRegion region._id}}selected{{/if}}">
                        {{region.name}}
                      </option>
                    {{/each}}
                  </select>
                </div>
              </div>
            {{/if}}
            {{> editCustomFields fields=(instance.customFields "boolean") values=customFields}}

            {{> editCustomFields fields=(instance.customFields "singleLine") values=customFields}}
          </div>
        {{/if}}
      </div>
      {{> editCustomFields fields=(instance.customFields "multiLine") values=customFields}}

      {{#if instance.showInternalCheckbox}}
        <div class="mb-3">
          <label class="form-label">{{i18n 'course.edit.intern' 'Hide on front page'}}</label>
          <div class="form-check">
            <input class="form-check-input js-check-internal" type="checkbox" value=""
                   id="internalCheckbox" {{isInternal}} />
            <label class="form-check-label" for="internalCheckbox">
              {{i18n 'course.edit.internDescription' "Only show when looking at a group's courses"}}
            </label>
          </div>
        </div>
      {{/if}}

      <div class="form-actions">
        {{> buttonSave event="js-course-edit-save" saving=saving}}
        {{#unless isFrame}}
          {{> buttonCancel event="js-course-edit-cancel"}}
        {{/unless}}
      </div>
    </div>
  </form>
</div>
}

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
    roles: ReactiveVar<{ [type: string]: { icon: string; enabled: boolean; enroll: boolean } }>;
  }
>;

const template = Template.courseEdit;

template.onCreated(function () {
  const instance = this;

  instance.busy(false);

  const userId = Meteor.userId();

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

  function availableRoles() {
    return Roles.filter((role) => {
      // Roles that are always on are not selectable here
      if (role.preset) {
        return false;
      }

      return true;
    });
  }

  function hasRole(members: CourseMemberEntity[] | undefined, role: string) {
    return members && hasRoleUser(members, role, userId);
  }

  const roles: { [type: string]: { icon: string; enabled: boolean; enroll: boolean } } = {};

  availableRoles().forEach((r) => {
    roles[r.type] = {
      icon: r.icon,
      enabled: instance.data.roles.includes(r.type) || false,
      enroll: hasRole(instance.data.members, r.type) || false,
    };
  });

  instance.roles = new ReactiveVar(roles);

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

  courseEditRolesAttr(): CourseEditRoleProps[] {
    const { roles } = Template.instance();

    return Object.entries(roles.get()).map((r) => {
      const type = r[0];
      return {
        type,
        ...r[1],
        onRole(checked: boolean) {
          const newRoles = { ...roles.get() };
          newRoles[type] = {
            ...r[1],
            enabled: checked,
          };
          roles.set(newRoles);
        },
        onEnroll(checked: boolean) {
          const newRoles = { ...roles.get() };
          newRoles[type] = {
            ...r[1],
            enroll: checked,
          };
          roles.set(newRoles);
        },
      };
    });
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
      Object.entries(instance.roles.get()).forEach(function (r) {
        changes.roles[r[0]] = r[1].enabled;
      });
      Object.entries(instance.roles.get())
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
            Alert.success(
              i18n("message.courseCreated", "{NAME} has been created!", {
                NAME: changes.name,
              }),
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
