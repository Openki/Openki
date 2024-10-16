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

export function Role(){
  return <>{{#if subscribed}}
  <div class="course-role-enrolled">
    <div class="course-role-title">
      <span class="{{role.icon}} fa-fw coursepage-role-icon"></span>&nbsp;
      <span>{{roleSubscribed role.type}}</span>
      <button type="button" class="js-role-unsubscribe-btn role-unsubscribe-btn btn btn-cancel"
              name="{{role.type}}">
        {{i18n 'course.roles.retract' 'Retract'}}
      </button>
      <button type="button"
              class="toggle-first-steps js-toggle-first-steps btn btn-link float-end">
        <i class="fa-solid fa-circle-info" aria-hidden="true"></i>
      </button>
    </div>
  </div>
  {{#if state 'showFirstSteps'}}
    <div class="course-role-first-steps">
      <b>{{i18n 'course.roles.firstSteps.title' 'Thank you for your interest in {COURSE}.' COURSE=course.name ROLE=(roleShort role.type)}}</b>
      <br>
      {{#if roleIs 'participant'}}
        {{i18n 'course.roles.firstSteps.youllGetNotified' 'You will get an e-mail notification as soon as a next date has been fixed.'}}
      {{/if}}
      {{#if roleIs 'host'}}
        {{i18n 'course.roles.firstSteps.informAboutVenue' 'If not done already, please mention the venue(s) you have access to in your personal message info.'}}
      {{/if}}
      {{#if roleIs 'mentor'}}
        {{i18n 'course.roles.firstSteps.mentionExperience' 'If not done already, please mention your experiences on the topic in your personal message info.'}}
        {{> courseGuide}}
      {{/if}}
      {{#if roleIs 'team'}}
        {{i18n 'course.roles.firstSteps.team' 'If not done already, you can start with chosing the venue and, if needed, looking for mentor(s) and then fix a date.'}}
        {{> courseGuide}}
      {{/if}}
      <br><br>
      {{i18n 'course.roles.firstSteps.ifQuestions' 'Please write questions concerning the course in the discussion below.'}}
      <br>
      {{i18n 'course.roles.firstSteps.allMembersInformed' 'All members of the organization-team will be informed.'}}
      <br>
      <button class="js-first-steps-comment btn btn-link p-0" type="button">
        {{i18n 'course.discussion.write_comment'}}
      </button>
    </div>
  {{/if}}
{{else}}
  <div class="course-role{{#if state 'enrolling'}}-enroll{{/if}}">
    {{#if state 'enrolling'}}
      <div class="course-role-title-enroll">
        <span class="{{role.icon}} fa-fw coursepage-role-icon" aria-hidden="true"></span>&nbsp;
        {{roleSubscribe role.type}}
      </div>
      <div class="course-role-enroll-options">
        <div class="mb-3">
          <label class="form-label">
            {{i18n 'course.roles.leave_message' 'You can leave a message to appear next to your name:'}}
          </label>
          {{#if roleIs 'participant'}}
            <textarea class='form-control js-comment'
                      placeholder="{{i18n 'course.roles.messageInfoParticipant' 'an (optional) message like a greeting, wish, or interest' attr=true}}">{{comment}}</textarea>
          {{/if}}
          {{#if roleIs 'host'}}
            <textarea class='form-control js-comment'
                      placeholder="{{i18n 'course.roles.messageInfoHost' 'an (optional) message including info about the venue' attr=true}}">{{comment}}</textarea>
          {{/if}}
          {{#if roleIs 'mentor'}}
            <textarea class='form-control js-comment'
                      placeholder="{{i18n 'course.roles.messageInfoMentor' 'an (optional) message including info about your experience on the topic' attr=true}}">{{comment}}</textarea>
          {{/if}}
          {{#if roleIs 'team'}}
            <textarea class='form-control js-comment'
                      placeholder="{{i18n 'course.roles.messageInfoMentor' attr=true}}">{{comment}}</textarea>
          {{/if}}
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-save js-role-subscribe-btn" {{disabledIfBusy}}>
            {{#if busy 'enrolling'}}
              <i class="fa-solid fa-circle-notch fa-spin fa-fw" aria-hidden="true"></i>
              {{i18n 'course.roles.join.busy' 'Joining…'}}
            {{else}}
              {{i18n 'course.roles.join' 'Join {COURSE}' COURSE=course.name}}
            {{/if}}
          </button>
          {{> buttonCancel event="js-role-enroll-cancel"}}
        </div>
      </div>
    {{else}}
      {{#if maySubscribe role.type}}
        <button type="button" class="btn btn-add text-start page-component-btn js-role-enroll-btn"
                name="participant">
          <span class="{{role.icon}} fa-fw coursepage-role-icon" aria-hidden="true"></span>&nbsp;
          {{roleSubscribe role.type}}
        </button>
      {{/if}}
    {{/if}}
  </div>
{{/if}}</>
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
