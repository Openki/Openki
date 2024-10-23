import { ReactiveVar } from "meteor/reactive-var";
import { Router } from "meteor/iron:router";
import { i18n } from "/imports/startup/both/i18next";
import { Meteor } from "meteor/meteor";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";

import { Courses } from "/imports/api/courses/courses";
import { EventModel } from "/imports/api/events/events";

import { ScssVars } from "/imports/ui/lib/scss-vars";
import * as Viewport from "/imports/ui/lib/viewport";

import "/imports/ui/components/buttons";
import "/imports/ui/components/courses/categories";
import "/imports/ui/components/courses/discussion";
import "/imports/ui/components/events/display/course-header";
import "/imports/ui/components/events/display/header";
import "/imports/ui/components/events/display/body";
import "/imports/ui/components/events/display/registration";
import "/imports/ui/components/events/edit";
import "/imports/ui/components/events/participants";
import "/imports/ui/components/events/replication";
import "/imports/ui/components/groups/tag";
import "/imports/ui/components/price-policy";
import "/imports/ui/components/regions/tag";
import "/imports/ui/components/sharing";
import "/imports/ui/components/report";
import "/imports/ui/components/venues/link";
import "/imports/ui/components/internal-indicator";
import "/imports/ui/components/delete-confirm-dialog";

import "./template.html";
import "./styles.scss";

const Template = TemplateAny as TemplateStaticTyped<
  "event",
  EventModel,
  {
    editing: ReactiveVar<boolean>;
    getCourseTitleIfAny: () => string | undefined;
  }
>;

const template = Template.event;

template.onCreated(function () {
  const instance = this;
  const event = instance.data;
  instance.busy(false);
  instance.editing = new ReactiveVar(!event._id);
  if (event.courseId) {
    instance.subscribe("courseDetails", event.courseId);
  }

  instance.getCourseTitleIfAny = () => {
    if (this.data.courseId) {
      return Courses.findOne({ _id: this.data.courseId })?.name;
    }
    return undefined;
  };
});

template.helpers({
  userName() {
    return Meteor.user()?.getDisplayName() || i18n("eventDetails.notLoggedIn", "(not logged in?)");
  },

  mobileViewport() {
    return Viewport.get().width <= ScssVars.screenMD;
  },

  select() {
    return Router.current().params.select;
  },

  courseLink() {
    const event = Template.instance().data;
    if (!event.courseId) {
      return "";
    }
    const course = Courses.findOne({ _id: event.courseId });
    return Router.path(
      "showCourse",
      { _id: event.courseId },
      course?.singleEvent ? { query: { force: "1" } } : {},
    );
  },

  course() {
    if (this.courseId) {
      return Courses.findOne(this.courseId);
    }
    return false;
  },

  mayEdit() {
    const event = Template.instance().data;
    const user = Meteor.user();
    if (!user) {
      return false;
    }
    return event.editableBy(user);
  },

  editing() {
    return this.new || Template.instance().editing.get();
  },
});

template.events({
  "click .js-event-edit"(_event, instance) {
    instance.editing.set(true);
  },
});
