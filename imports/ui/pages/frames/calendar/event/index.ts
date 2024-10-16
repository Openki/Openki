import { ReactiveVar } from "meteor/reactive-var";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";
import { _ } from "meteor/underscore";
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
