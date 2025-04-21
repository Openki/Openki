import { ReactiveVar } from "meteor/reactive-var";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";
import { Spacebars } from "meteor/spacebars";
import { Session } from "meteor/session";

import { EventModel } from "/imports/api/events/events";
import { Regions } from "/imports/api/regions/regions";

import "./template.html";

const Template = TemplateAny as TemplateStaticTyped<
  "frameCalendarEvent",
  EventModel,
  {
    expanded: ReactiveVar<boolean>;
  }
>;

const template = Template.frameCalendarEvent;

template.onCreated(function () {
  this.expanded = new ReactiveVar(false);
});

template.helpers({
  allRegions() {
    return Session.equals("region", "all");
  },

  regionName() {
    return Regions.findOne(this.region)?.name;
  },

  expanded: () => Template.instance().expanded.get(),

  getAttendees() {
    const { data } = Template.instance();
    return data.numberOfParticipants();
  },

  getTotalAvailableSeats() {
    const { data } = Template.instance();
    return data.maxParticipants || Spacebars.SafeString("&#8734;");
  },

  isUnlimited() {
    const { data } = Template.instance();
    return !data.maxParticipants;
  },
});

template.events({
  "click .js-toggle-event-details"(event, instance) {
    $(event.currentTarget).toggleClass("active");
    instance.$(".frame-list-item-time").toggle();
    instance.expanded.set(!instance.expanded.get());
  },
});


export function Event(){
  return <div class="frame-list-item {{#if canceled}}frame-list-item-canceled{{/if}}">
  <h4 class="frame-list-item-header js-toggle-event-details">
    <span class="frame-list-item-toggle-indicator">
      <i class="fa-solid fa-angle-down"></i>
    </span>
    {{#unless noRsvp}}
      <div class="frame-list-free-seats" data-bs-toggle="tooltip" data-bs-title="{{#if isUnlimited}}
                {{i18n 'frame.list.reservation.status.unlimited.tooltip' '{RESERVEDSEATS} of unlimited seats reserved' RESERVEDSEATS=getAttendees}}
              {{else}}
                {{i18n 'frame.list.reservation.status.tooltip' '{RESERVEDSEATS} of {TOTALSEATS} seats reserved' RESERVEDSEATS=getAttendees TOTALSEATS=getTotalAvailableSeats}}
              {{/if}}">
        {{getAttendees}}/{{getTotalAvailableSeats}}
      </div>
      <i class="fa-solid fa-user frame-list-free-seats" aria-hidden="true"></i>
    {{/unless}}

    <span class="frame-list-item-time">
      {{timeFormat start}}
    </span>
    <strong>{{title}}</strong>
    {{#if allRegions}}
      <span class="badge bg-primary frame-list-item-region">{{regionName}}</span>
    {{/if}}

  </h4>
  {{#if expanded}}
    <div class="p-2">
      <div class="row">
        <div class="col-4 col-sm-2">
          <strong>{{i18n 'frame.eventsList.when' 'When:'}}</strong>
        </div>
        <div class="col-8 col-sm-10">
          {{timeFormat start}} - {{timeFormat end}}
        </div>
      </div>
      <div class="row">
        <div class="col-4 col-sm-2">
          <strong>{{i18n 'frame.eventsList.where' 'Where:'}}</strong>
        </div>
        <div class="col-8 col-sm-10">
          {{#if venue._id}}
            <a href="{{pathFor 'venueDetails' _id=venue._id}}" target="_blank">
              {{venue.name}}
            </a>
          {{else}}
            {{venue.name}}
          {{/if}}
          {{#if room}}
            - {{room}}
          {{/if}}
        </div>
      </div>
      <div class="row">
        <div class="col-sm-2">
          <strong>{{i18n 'frame.eventsList.description' 'Description:'}}</strong>
        </div>
        <div class="col-sm-10">
          {{{description}}}
        </div>
      </div>
      <div class="mt-2 d-grid d-sm-flex">
        <a class="btn btn-outline-dark" href="{{pathFor 'showEvent'}}" target="_blank">
          {{i18n 'frame.calendar.moreAboutThisEvent' 'More about this event on {SITENAME}' SITENAME=siteName}}
        </a>
      </div>
    </div>
  {{/if}}
</div>
}
