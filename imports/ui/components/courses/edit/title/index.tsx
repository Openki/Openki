import { i18n } from "/imports/startup/both/i18next";
import { ReactiveVar } from "meteor/reactive-var";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";
import { _ } from "meteor/underscore";
import { Session } from "meteor/session";

import { Courses } from "/imports/api/courses/courses";

import "./template.html";
import "./styles.scss";

const Template = TemplateAny as TemplateStaticTyped<
  "courseTitle",
  Record<string, unknown>,
  {
    proposedSearch: ReactiveVar<string>;
    focused: ReactiveVar<boolean>;
    dropdownVisible: () => boolean;
  }
>;

const template = Template.courseTitle;
template.onCreated(function () {
  this.proposedSearch = new ReactiveVar("");
  this.focused = new ReactiveVar(false);

  this.dropdownVisible = () => this.focused.get() && this.proposedSearch.get().length > 3;

  this.autorun(() => {
    if (this.dropdownVisible()) {
      this.subscribe("Courses.findFilter", {
        search: this.proposedSearch.get(),
        region: Session.get("region"),
      });
      if (!this.$(".dropdown").hasClass("open")) {
        this.$(".dropdown-toggle").dropdown("toggle");
      }
    }
  });
});

template.helpers({
  proposedCourses() {
    const instance = Template.instance();
    const search = instance.proposedSearch.get();
    const region = Session.get("region");
    if (instance.dropdownVisible()) {
      return Courses.findFilter({ search, region }, 20, undefined, [["name", "asc"]]);
    }
    return [];
  },
  attributes() {
    // Fix: Wrong encoding in french
    return {
      placeholder: i18n("course.title.placeholder", "What are you interested in?"),
    };
  },
});

template.events({
  "keydown .js-title"(event, instance) {
    if ((event as any).keyCode === 9) {
      instance.$(".dropdown-toggle").dropdown("toggle");
      instance.focused.set(false);
    }
  },

  "keyup .js-title"(event, instance) {
    // arrow down does not work in bootstrap dropdown widget
    if ((event as any).keyCode === 40) {
      instance.$(".js-proposed-courses").find("a:first").trigger("focus");
    }
  },

  "input .js-title": _.debounce((event, instance) => {
    instance.proposedSearch.set((event.target as any).value);
  }, 220),

  "focus .js-title"(_event, instance) {
    instance.focused.set(true);
  },

  "focusout .js-proposed-search"(event, instance) {
    if (instance.$((event as any).relatedTarget).closest(".js-proposed-search").length === 0) {
      instance.focused.set(false);
    }
  },

  "keydown .js-dropdown-entry"(event, instance) {
    if ((event as any).keyCode === 9 && !(event as any).shiftKey) {
      instance.$(".dropdown-toggle").dropdown("toggle");
    }
  },
});
