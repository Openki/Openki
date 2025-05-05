import $ from "jquery";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";
import moment from "moment";

import "/imports/ui/components/search-field";
import "/imports/ui/components/filter-groups";
import "/imports/ui/components/filter-categories";

import "./control";

import "./template.html";
import "../styles.scss";

export interface Data {
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
}

const Template = TemplateAny as TemplateStaticTyped<"calendarNavDay", Data>;

const template = Template.calendarNavDay;

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
  controlAttr(direction: string) {
    const data = Template.instance().data;
    return { direction, date: data.date, onChangeDate: data.onChangeDate };
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


export function Day(){
  return <div class="calendar-nav-container">
  <div class="row align-items-center p-1">
    <div class="col-md-3 col-lg-4 p-1">
      {{> searchField searchFieldAttr}}
    </div>
    <div class="col-md-6 col-lg-4 p-1">
      <div class="row justify-content-center align-items-center">
        {{#unless hideSwitches}}
          {{> calendarNavDayControl controlAttr 'previous'}}
        {{/unless}}
        <div class="col-auto">
          <div class="lead">
            <span class="d-none d-md-inline-block">{{dateLong date}}</span>
            <span class="d-md-none">{{dateShort date}}</span>
          </div>
          <div>
            {{i18n "calendar.weekNumber" "Week"}} {{weekNr date}}
          </div>
        </div>
        {{#unless hideSwitches}}
          {{> calendarNavDayControl controlAttr 'next' }}
        {{/unless}}
      </div>
    </div>
    <div class="row align-items-center p-1">
      {{#if availableGroups}}
        <div class="col-md-4 col-lg-2 p-1">
          {{> filterGroups filterGroupsAttr}}
        </div>
      {{/if}}
      <div class="col-md-4 col-lg-2 p-1">
        {{> filterCategories filterCategoriesAttr}}
      </div>
      {{#if currentUser}}
        <div
             class="{{#unless availableGroups}}offset-md-4 offset-lg-2 {{/unless}}col-md-8 col-lg-4 p-1">
          <div class="form-check form-switch">
            <input type="checkbox" id="filter-own-events"
                   class="form-check-input float-none js-filter-own-events"
                   name="filter-own-events">
            <label
                   for="filter-own-events">{{i18n 'calendar.filter-own-events' 'Show my events only'}}</label>
          </div>
        </div>
      {{/if}}
    </div>
  </div>
</div>
}
