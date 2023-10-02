import $ from "jquery";
import { ReactiveVar } from "meteor/reactive-var";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";
import moment from "moment";

import "./control";

import "./template.html";
import "../styles.scss";

const Template = TemplateAny as TemplateStaticTyped<
  "calendarNavMulti",
  { date: unknown; setIsAttendeeFilterOn: (state: boolean) => void },
  { currentUnit: ReactiveVar<string> }
>;

const template = Template.calendarNavMulti;

template.helpers({
  endDateTo(date: moment.Moment) {
    return moment(date).add(6, "days");
  },
});

template.onCreated(function () {
  this.currentUnit = new ReactiveVar("week");
});

template.onRendered(function () {
  const navContainer = this.$(".calendar-nav-container");
  navContainer.slideDown();

  $(window).on("scroll", () => {
    const isCovering = navContainer.hasClass("calendar-nav-container-covering");
    const atTop = ($(window).scrollTop() || 0) < 5;

    if (!isCovering && !atTop) {
      navContainer.addClass("calendar-nav-container-covering");
    } else if (isCovering && atTop) {
      navContainer.removeClass("calendar-nav-container-covering");
    }
  });
});

template.events({
  "change .js-filter-own-events"(event) {
    // call the parent method that gets passed into this template as a (prop) argument
    Template.instance().data.setIsAttendeeFilterOn((event.target as HTMLInputElement).checked);
  },
});
