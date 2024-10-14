import { Router } from "meteor/iron:router";
import { Meteor } from "meteor/meteor";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";
import { _ } from "meteor/underscore";
import { ReactiveDict } from "meteor/reactive-dict";
import { textPlain } from "/imports/utils/html-tools";
import { truncate } from "/imports/utils/string-tools";

import * as Alert from "/imports/api/alerts/alert";
import { Regions } from "/imports/api/regions/regions";
import * as CoursesMethods from "/imports/api/courses/methods";
import { RoleEntity } from "/imports/api/roles/roles";
import { CourseModel } from "/imports/api/courses/courses";

import { Editable } from "/imports/ui/lib/editable";
import { PleaseLogin } from "/imports/ui/lib/please-login";
import { ScssVars } from "/imports/ui/lib/scss-vars";
import * as TemplateMixins from "/imports/ui/lib/template-mixins";
import * as Viewport from "/imports/ui/lib/viewport";

import { PublicSettings } from "/imports/utils/PublicSettings";
import * as UserPrivilegeUtils from "/imports/utils/user-privilege-utils";
import * as Analytics from "/imports/ui/lib/analytics";
import { getLocalizedValue } from "/imports/utils/getLocalizedValue";
import { i18n } from "/imports/startup/both/i18next";
import * as Metatags from "/imports/utils/metatags";

import "/imports/ui/components/buttons";
import "/imports/ui/components/courses/display/group-list";
import "/imports/ui/components/courses/categories";
import "/imports/ui/components/courses/discussion";
import "/imports/ui/components/courses/edit";
import "/imports/ui/components/courses/events";
import "/imports/ui/components/courses/history";
import "/imports/ui/components/courses/files";
import "/imports/ui/components/courses/members";
import "/imports/ui/components/courses/roles";
import "/imports/ui/components/editable";
import "/imports/ui/components/groups/tag";
import "/imports/ui/components/price-policy";
import "/imports/ui/components/regions/tag";
import "/imports/ui/components/sharing";
import "/imports/ui/components/report";
import "/imports/ui/components/internal-indicator";

import "./template.html";
import "./styles.scss";

{
  const Template = TemplateMixins.Expandible(
    TemplateAny as TemplateStaticTyped<
      "courseDetailsPage",
      {
        edit: boolean;
        rolesDetails: {
          role: RoleEntity;
          subscribed: boolean;
          course: CourseModel;
        }[];
        course: CourseModel;
        member: boolean;
        select: string;
      },
      { editableName: Editable; editableDescription: Editable }
    >,
    "courseDetailsPage",
  );

  const template = Template.courseDetailsPage;

  template.onCreated(function () {
    const instance = this;

    instance.autorun(() => {
      const { course } = Template.currentData();
      Metatags.setCommonTags(
        course.name,
        truncate(textPlain(course.description), 160),
        course.publicUrlForDetailsImage(),
      );
    });

    instance.busy(false);

    const { course } = instance.data;

    instance.editableName = new Editable(false, i18n("course.title.placeholder"), undefined, {
      onSave: async (newName) => {
        await CoursesMethods.save(course._id, { name: newName });
      },
      onSuccess: (newName) => {
        Alert.success(
          i18n("courseDetails.message.nameChanged", 'The name has been changed to "{NAME}".', {
            NAME: newName,
          }),
        );
      },
      onError: (err) => {
        Alert.serverError(err as string | Error, i18n("course.save.error", "Saving went wrong"));
      },
    });

    instance.editableDescription = new Editable(
      true,
      i18n("course.description.placeholder"),
      PublicSettings.courseDescriptionMax,
      {
        onSave: async (newDescription) => {
          await CoursesMethods.save(course._id, { description: newDescription });
        },
        onSuccess: () => {
          Alert.success(
            i18n(
              "courseDetails.message.descriptionChanged",
              "The description of {NAME} has been changed.",
              { NAME: course.name },
            ),
          );
        },
        onError: (err) => {
          Alert.serverError(err as string | Error, i18n("course.save.error"));
        },
      },
    );

    instance.autorun(() => {
      const data = Template.currentData();

      if (!data.course) {
        return;
      }

      const { name: courseName, description: courseDescription } = data.course;

      instance.editableName.setText(courseName);
      instance.editableDescription.setText(courseDescription);
    });
  });

  template.helpers({
    // more helpers in course.roles.js

    detailsHeaderAttr(course: CourseModel) {
      const src = course?.publicUrlForDetailsImage();
      if (!src) {
        return {};
      }

      return {
        style: `
		background-image: linear-gradient(rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.75)), url('${src}');
		background-position: center;
		background-size: cover;`,
      };
    },

    mayEdit(course: CourseModel) {
      return course?.editableBy(Meteor.user());
    },
    courseStateClasses(course: CourseModel) {
      const classes = [];

      if (course?.nextEvent) {
        classes.push("has-upcoming-events");
      } else if (course?.lastEvent) {
        classes.push("has-past-events");
      } else {
        classes.push("is-proposal");
      }

      if (course?.archived) {
        classes.push("is-archived");
      }

      return classes.join(" ");
    },
    mobileViewport() {
      return Viewport.get().width <= ScssVars.screenMD;
    },
    isProposal(course: CourseModel) {
      return !course.nextEvent && !course.lastEvent;
    },
  });

  template.events({
    async "click .js-delete-course-confirm"(_event, instance) {
      instance.busy("deleting");
      PleaseLogin(instance, async () => {
        const { course } = instance.data;

        try {
          await CoursesMethods.remove(course._id);

          Alert.success(
            i18n("courseDetailsPage.message.courseHasBeenDeleted", "{COURSE} was deleted.", {
              COURSE: course.name,
            }),
          );

          let role;
          if (_.intersection(Meteor.user()?.badges || [], course.editors).length > 0) {
            role = "team";
          } else if (UserPrivilegeUtils.privilegedTo("admin")) {
            role = "admin";
          } else {
            role = "unknown";
          }

          Analytics.trackEvent(
            "Course deletions",
            `Course deletions as ${role}`,
            Regions.findOne(course.region)?.nameEn,
          );

          Router.go("/");
        } catch (err) {
          Alert.serverError(
            err,
            i18n("courseDetailsPage.message.courseHasBeenDeleted.error", "Removing went wrong"),
          );
        } finally {
          instance.busy(false);
        }
      });
    },

    async "click .js-course-archive"(_event, instance) {
      instance.busy("archive");
      PleaseLogin(instance, async () => {
        const { course } = instance.data;
        try {
          await CoursesMethods.archive(course._id);
          instance.collapse();

          Alert.success(
            i18n("courseDetailsPage.message.courseHasBeenArchived", "{COURSE} was archived.", {
              COURSE: course.name,
            }),
          );
        } catch (err) {
          Alert.serverError(
            err,
            i18n("courseDetailsPage.message.courseHasBeenArchived.error", "Archiving went wrong"),
          );
        } finally {
          instance.busy(false);
        }
      });
    },

    async "click .js-course-unarchive"(_event, instance) {
      instance.busy("unarchive");
      PleaseLogin(instance, async () => {
        const { course } = instance.data;
        try {
          await CoursesMethods.unarchive(course._id);

          Alert.success(
            i18n(
              "courseDetailsPage.message.courseHasBeenUnarchived",
              "{COURSE} has been unarchived.",
              { COURSE: course.name },
            ),
          );
        } catch (err) {
          Alert.serverError(
            err,
            i18n(
              "courseDetailsPage.message.courseHasBeenUnarchived.error",
              "Unarchiving went wrong",
            ),
          );
        } finally {
          instance.busy(false);
        }
      });
    },

    "click .js-course-edit"(_event, instance) {
      instance.collapse();

      const { course } = instance.data;

      const query: {
        edit: string;
        force?: string;
      } = { edit: "course" };
      const force = Router.current().params.query.force;
      if (force) {
        query.force = force;
      }
      Router.go("showCourse", course, { query });
    },
  });
}
{
  const Template = TemplateAny as TemplateStaticTyped<
    "courseDetailsSubmenu",
    {
      edit: boolean;
      rolesDetails: {
        role: RoleEntity;
        subscribed: boolean;
        course: CourseModel;
      }[];
      course: CourseModel;
      member: boolean;
      select: string;
      editableDescription: Editable;
    },
    {
      state: ReactiveDict<{
        descriptionTruncated: boolean;
      }>;
    }
  >;

  const template = Template.courseDetailsSubmenu;

  template.onCreated(function () {
    const instance = this;
    instance.state = new ReactiveDict();
    instance.state.setDefault({
      descriptionTruncated: true,
    });
  });

  template.onRendered(function () {
    const instance = this;

    instance.autorun(async () => {
      // function to check if the description is longer than the div that displays it
      const courseDescriptionElement = instance.$(".course-description")[0];
      if (courseDescriptionElement) {
        instance.state.set({
          descriptionTruncated:
            courseDescriptionElement.scrollHeight > courseDescriptionElement.clientHeight,
        });
      }
    });
  });

  template.helpers({
    mayEdit() {
      const { course } = Template.instance().data;
      return course?.editableBy(Meteor.user());
    },
    customFields() {
      const { course } = Template.instance().data;
      const user = Meteor.user();

      const isEditor = user && course.editableBy(user);

      return (
        course.customFields
          ?.filter((i) => i.visibleFor === "all" || (i.visibleFor === "editors" && isEditor))
          .map((i) => ({
            displayText: getLocalizedValue(i.displayText),
            isboolean: typeof i.value === "boolean",
            value: i.value,
          })) || []
      );
    },
  });

  template.events({
    "click .js-course-desciption-show-more"() {
      // toggles the showMore
      const { state } = Template.instance();
      state.set({ descriptionTruncated: false });
    },

    "click .editable-wrap"() {
      // sets the state when the user starts editing
      const instance = Template.instance();
      instance.state.set({ descriptionTruncated: false });
    },
  });
}
{
  const Template = TemplateAny as TemplateStaticTyped<
    "courseDetailsDescription",
    {
      edit: boolean;
      rolesDetails: {
        role: RoleEntity;
        subscribed: boolean;
        course: CourseModel;
      }[];
      course: CourseModel;
      member: boolean;
      select: string;
    }
  >;

  const template = Template.courseDetailsDescription;

  template.helpers({
    mayEdit() {
      const { course } = Template.instance().data;
      return course?.editableBy(Meteor.user());
    },
  });
}
