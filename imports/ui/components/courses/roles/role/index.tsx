import { Router } from "meteor/iron:router";
import { Meteor } from "meteor/meteor";
import { i18n } from "/imports/startup/both/i18next";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";
import { ReactiveDict } from "meteor/reactive-dict";

import * as Alert from "/imports/api/alerts/alert";
import { Subscribe, Unsubscribe, processChange } from "/imports/api/courses/subscription";
import { Regions } from "/imports/api/regions/regions";
import { Users } from "/imports/api/users/users";
import { RoleEntity } from "/imports/api/roles/roles";
import { CourseModel } from "/imports/api/courses/courses";

import { PleaseLogin } from "/imports/ui/lib/please-login";
import { routerAutoscroll } from "/imports/ui/lib/router-autoscroll";

import * as Analytics from "/imports/ui/lib/analytics";

import "/imports/ui/components/buttons";

import "./template.html";
import "./styles.scss";

export interface Data {
  role: RoleEntity;
  subscribed: boolean;
  comment: string;
  course: CourseModel;
}

const Template = TemplateAny as TemplateStaticTyped<
  "courseRole",
  Data,
  {
    state: ReactiveDict<{ enrolling: boolean; showFirstSteps: boolean }>;
    courseSubscribe: (comment?: string) => Subscribe;
  }
>;

const template = Template.courseRole;

template.onCreated(function () {
  const instance = this;

  instance.busy(false);
  instance.state = new ReactiveDict();
  instance.state.setDefault({ enrolling: false, showFirstSteps: false });

  // Build a subscribe change
  instance.courseSubscribe = (comment) => {
    const user = Users.currentUser();
    return new Subscribe(
      instance.data.course,
      user._id,
      instance.data.role.type,
      "interested",
      comment,
    );
  };

  // unsubscribe by email
  // HACK this is not the right place to act on router actions
  if (Router.current().params.query.unsubscribe === instance.data.role.type) {
    PleaseLogin(instance, async () => {
      const user = Meteor.user();
      const change = new Unsubscribe(instance.data.course, user?._id, instance.data.role.type);
      if (change.validFor(user)) {
        await processChange(change);
        Alert.success(
          i18n("course.roles.unsubscribed", "Unsubscribed from {NAME}", {
            NAME: instance.data.course.name,
          }),
        );
      } else {
        Alert.error(`${change} not valid for ${user}`);
      }

      // After unsubscribe got to the event. Equals in route 'showCourse'.
      const course = instance.data.course;
      if (course?.singleEvent && course.nextEvent) {
        Router.go("showEvent", course.nextEvent, { replaceState: true });
      }
    });
  }
});

template.helpers({
  roleSubscribe(type: string) {
    return i18n(`roles.${type}.subscribe`);
  },

  roleSubscribed(type: string) {
    return i18n(`roles.${type}.subscribed`);
  },

  roleIs(type: string) {
    const { data } = Template.instance();
    return data.role.type === type;
  },

  maySubscribe() {
    const operator = Users.currentUser();
    return Template.instance().courseSubscribe().validFor(operator);
  },
});

template.events({
  "click .js-role-enroll-btn"(event, instance) {
    event.preventDefault();
    instance.state.set("enrolling", true);
  },

  "click .js-role-subscribe-btn"(event, instance) {
    event.preventDefault();
    routerAutoscroll.cancelNext();

    const { data } = instance;
    const comment = (instance.$(".js-comment").val() as string).trim();
    instance.busy("enrolling");
    PleaseLogin(
      instance,
      async () => {
        await processChange(instance.courseSubscribe(comment));
        routerAutoscroll.cancelNext();
        instance.busy(false);
        instance.state.set("showFirstSteps", true);
        instance.state.set("enrolling", false);

        Analytics.trackEvent(
          "Enrollments in courses",
          `Enrollments in courses as ${data.role.type}`,
          Regions.findOne(data.course.region)?.nameEn,
        );
      },
      data.role.type === "participant",
    );
  },

  "click .js-role-enroll-cancel"(_event, instance) {
    instance.state.set("enrolling", false);
    return false;
  },

  async "click .js-role-unsubscribe-btn"(event, instance) {
    event.preventDefault();
    routerAutoscroll.cancelNext();

    const { data } = instance;

    const change = new Unsubscribe(data.course, Meteor.userId(), data.role.type);
    await processChange(change);
    routerAutoscroll.cancelNext();
    Analytics.trackEvent(
      "Unsubscribes from courses",
      `Unsubscribes from courses as ${data.role.type}`,
      Regions.findOne(data.course.region)?.nameEn,
    );
  },

  "click .js-toggle-first-steps"(_event, instance) {
    instance.state.set("showFirstSteps", !instance.state.get("showFirstSteps"));
  },

  "click .js-first-steps-comment"() {
    document.getElementById("discussion")?.dispatchEvent(new Event("writeComment"));
  },
});
