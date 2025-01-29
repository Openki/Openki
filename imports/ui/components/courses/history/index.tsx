import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";
import { Meteor } from "meteor/meteor";

import { Events } from "/imports/api/events/events";
import { CourseModel } from "/imports/api/courses/courses";

import "/imports/ui/components/profile-link";

import "./template.html";
import "./styles.scss";


<template name="eventHeldHistoryEntry">
  <span class="fa-regular fa-calendar-days fa-fw" aria-hidden="true"></span>
  <a href="{{pathFor 'showEvent'}}">
    {{this.title}}
  </a>
</template>

<template name="userSubscribedHistoryEntry">
  <i class="{{roleIcon role}} fa-fw" aria-hidden="true"></i>
  {{> profileLink userId=user}}
  {{contribution user}}
  {{i18n 'course.history.userSubscribed' 'joined as {ROLE}' ROLE=(roleShort role)}}
</template>

<template name="userUnsubscribedHistoryEntry">
  <i class="{{roleIcon role}} fa-fw" aria-hidden="true"></i>
  {{> profileLink userId=user}}
  {{contribution user}}
  {{i18n 'course.history.userUnsubscribed' 'retract {ROLE}' ROLE=(roleShort role)}}
</template>

<template name="groupPromoteHistoryEntry">
  {{> groupTag groupId=group full=true}}
  {{#if enable}}
    {{i18n 'course.history.groupPromote.added' 'got added by'}}
  {{else}}
    {{i18n 'course.history.groupPromote.removed' 'got removed by'}}
  {{/if}}
  {{> profileLink userId=user}}
  {{contribution user}}
</template>

<template name="groupOrgaHistoryEntry">
  {{> groupTag groupId=group full=true}}
  {{#if enable}}
    {{i18n 'course.history.groupOrga.added' 'got added as orga-group by'}}
  {{else}}
    {{i18n 'course.history.groupOrga.removed' 'got removed as orga-group by'}}
  {{/if}}
  {{> profileLink userId=user}}
  {{contribution user}}
</template>

<template name="eventInsertedHistoryEntry">
  <span class="fa-regular fa-calendar-days fa-fw" aria-hidden="true"></span>
  <a href="{{pathFor 'showEvent'}}">
    {{weekdayFormat startLocal}}
    {{calendarDayShort startLocal}}
    {{this.title}}
  </a>
  {{i18n 'course.history.eventInserted' 'created by'}}
  {{> profileLink userId=createdBy}}
  {{contribution createdBy}}
</template>

<template name="eventUpdatedHistoryEntry">
  <span class="fa-regular fa-calendar-days fa-fw" aria-hidden="true"></span>
  <a href="{{pathFor 'showEvent'}}">
    {{weekdayFormat startLocal}}
    {{calendarDayShort startLocal}}
    {{this.title}}
  </a>
  {{#if replicasUpdated}}
    {{i18n 'course.history.eventAndRepeatsUpdated' 'and repeats updated by'}}
  {{else}}
    {{i18n 'course.history.eventUpdated' 'updated by'}}
  {{/if}}
  {{> profileLink userId=updatedBy}}
  {{contribution updatedBy}}
</template>

<template name="eventRemovedHistoryEntry">
  <span class="fa-regular fa-calendar-days fa-fw" aria-hidden="true"></span>
  {{weekdayFormat startLocal}}
  {{calendarDayShort startLocal}}
  {{this.title}}
  {{i18n 'course.history.eventRemoved' 'removed by'}}
  {{> profileLink userId=removedBy}}
  {{contribution removedBy}}
</template>

<template name="updatedHistoryEntry">
  {{i18n 'course.history.updated' 'Updated by'}}
  {{> profileLink userId=updatedBy}}
  {{contribution updatedBy}}
</template>

<template name="createdHistoryEntry">
  {{i18n 'course.history.created_by' 'Created by'}}
  {{> profileLink userId=createdby}}
  {{contribution createdby}}
</template>

const Template = TemplateAny as TemplateStaticTyped<"coursehistory", { course: CourseModel }>;

const template = Template.coursehistory;

template.helpers({
  pastEventsList() {
    const instance = Template.instance();
    const { course } = instance.data;

    const historyEntries: { dateTime: Date | undefined; template: string; data: object }[] = [];

    const user = Meteor.user();

    const history =
      user && course.editableBy(user)
        ? course.history
        : course.history?.filter((e) => e.type !== "groupPromote" && e.type !== "groupOrga");

    // add past events
    historyEntries.push(
      ...Events.find(
        { courseId: course._id, start: { $lt: new Date() } },
        { limit: 100 }, // Hack: https://gitlab.com/Openki/Openki/-/issues/1768
      ).map((e) => ({
        dateTime: e.start,
        template: "eventHeldHistoryEntry",
        data: e,
      })),
    );

    // merge with all history entries
    historyEntries.push(
      ...(history?.map((e) => ({
        dateTime: e.dateTime,
        template: `${e.type}HistoryEntry`,
        data: e.data,
      })) || []),
    );

    // and with the course creation
    historyEntries.push({
      dateTime: course.time_created,
      template: "createdHistoryEntry",
      data: course,
    });

    // and sort by date time desc
    return historyEntries
      .sort((a, b) => (b.dateTime?.getTime() || 0) - (a.dateTime?.getTime() || 0))
      .slice(0, 200); // Hack: https://gitlab.com/Openki/Openki/-/issues/1768
  },
});

<template name="coursehistory">
  <div class="container">
    <div class="timeline-pre row">
      <div class="col-1 offset-3">
        <div class="timeline-start"></div>
      </div>
    </div>
    {{#each event in pastEventsList}}
      <div class="row">
        <div class="timeline-eventdate col-3" title="{{dateLong event.dateTime}}">
          {{fromNow event.dateTime}}
        </div>
        <div class="timeline-eventline-container col-1">
          <div class="timeline-eventline">
            <div class="timeline-eventpoint"></div>
          </div>
        </div>
        <div class="coursehistory-event col-8">
          {{> Template.dynamic template=event.template data=event.data}}
        </div>
      </div>
    {{/each}}
    <div class="timeline-post row">
      <div class="col-1 offset-3">
        <div class="timeline-end"></div>
      </div>
    </div>
  </div>
</template>
