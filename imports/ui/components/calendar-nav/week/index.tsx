import $ from "jquery";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";
import moment from "moment";

import "/imports/ui/components/search-field";
import "/imports/ui/components/filter-groups";
import "/imports/ui/components/filter-categories";
import "./control";

import "./template.html";
import "../styles.scss";

export type Data = {
  hideSwitches: boolean;
  search: string;
  onChangeSearch: (newValue: string) => void;
  date: moment.Moment;
  onChangeDate: (newDate: moment.Moment) => void;
  availableGroups: string[];
  selectedGroups: string[];
  onAddGroup: (group: string) => void;
  onRemoveGroup: (group: string) => void;
  categories: string[];
  onAddCategory: (category: string) => void;
  onRemoveCategory: (category: string) => void;
  onChangeAttendingEventsOnly: (state: boolean) => void;
};


  const Template = TemplateAny as TemplateStaticTyped<"calendarNavWeek", Data>;

  const template = Template.calendarNavWeek;

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
  template.helpers({
    endDateTo(date: moment.Moment) {
      return moment(date).add(6, "days");
    },
    searchFieldAttr() {
      const data = Template.instance().data;
      return { search: data.search, onChange: data.onChangeSearch };
    },
    filterGroupsAttr() {
      const data = Template.instance().data;
      return {
        availableGroups: data.availableGroups,
        selectedGroups: data.selectedGroups,
        onAdd: data.onAddGroup,
        onRemove: data.onRemoveGroup,
      };
    },
    filterCategoriesAttr() {
      const data = Template.instance().data;
      return {
        categories: data.categories,
        onAdd: data.onAddCategory,
        onRemove: data.onRemoveCategory,
      };
    },
  });

  template.events({
    "click .js-filter-own-events"(event) {
      const radioSwitch = event.target as HTMLInputElement;
      if (Meteor.userId()) {
        Template.instance().data.onChangeAttendingEventsOnly(radioSwitch.checked);
      } else {
        radioSwitch.checked = false;
        $(".js-account-tasks").modal("show");
      }
    },
  });

