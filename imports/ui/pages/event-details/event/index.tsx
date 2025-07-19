import React from "react";
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
  // eslint-disable-next-line @typescript-eslint/no-this-alias
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

  eventEditAttr() {
    const instance = Template.instance();
    const event = instance.data;

    return {
      event,
      afterSave: () => {
        instance.editing.set(false);
      },
      onCancel: () => {
        if ("new" in event) {
          window.history.back();
        } else {
          instance.editing.set(false);
        }
      },
    };
  },

  eventDisplayAttr() {
    const instance = Template.instance();
    const event = instance.data;

    return {
      event,
      onRemove: () => {
        instance.editing.set(false);
      },
      onEdit: () => {
        instance.editing.set(true);
      },
    };
  },
});

function Event(){
  return   <div class="row">
    <div class="col-lg-8 mb-3">
      {{#if this.canceled}}
        <div class="alert alert-canceled text-center" role="alert">
          <strong>{{i18n 'event.canceled.alert' '{EVENT} got canceled.' EVENT=this.title}}</strong>
        </div>
      {{/if}}
      {{#if course}}
        {{#unless course.singleEvent}}
          {{> eventCourseHeader backlink=courseLink headerlink=courseLink regionId=region categories=categories title=course.name image=course.publicUrlForDetailsImage}}
        {{else}}
          {{#if mayEdit}}
            {{> eventCourseHeader course=course backlink=courseLink regionId=region categories=categories title=title image=course.publicUrlForDetailsImage}}
          {{else}}
            {{> eventCourseHeader course=course regionId=region categories=categories title=title image=course.publicUrlForDetailsImage}}
          {{/if}}
        {{/unless}}
      {{/if}}
      <div class="event{{#if course}} course-event{{/if}}">
        {{#if editing}}
          {{> eventEdit eventEditAttr}}
        {{else}}
          {{> eventDisplay eventDisplayAttr}}
        {{/if}}
      </div>
      {{#unless mobileViewport}}
        {{#unless editing}}
          {{#if course.singleEvent}}
            {{> discussion courseId=course._id eventId=_id select=select}}
          {{/if}}
        {{/unless}}
      {{/unless}}
    </div>
    {{#unless editing}}
      <div class="col-lg-4">
        {{> eventRegistration event=this}}
        {{#if mobileViewport}}
          {{#if course.singleEvent}}
            {{> discussion courseId=course._id eventId=_id select=select}}
          {{/if}}
        {{/if}}
        {{! style fixes a problem that occurs during the transition to react. This can be removed when everything is changed to react. }}
        <div class="page-component mt-3">
          {{> report}}
        </div>
      </div>
    {{/unless}}
  </div>
}
