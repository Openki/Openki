import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";
import { i18n } from "/imports/startup/both/i18next";

import { Roles } from "/imports/api/roles/roles";

import { FilterPreview } from "/imports/ui/lib/filter-preview";

import "/imports/ui/components/filter-categories";

import "./template.html";
import "./styles.scss";

type Role = { icon?: string | undefined; name: string; label: string };

const Template = TemplateAny as TemplateStaticTyped<
  "additionalFilters",
  unknown,
  { findInstance: any; roles: Role[] }
>;

const template = Template.additionalFilters;

template.onCreated(function () {
  this.findInstance = this.parentInstance(2);
  this.autorun(() => {
    this.roles = [
      {
        name: "team",
        label: i18n("find.needsOrganizer", "Looking for an organizer"),
      },
      {
        name: "mentor",
        label: i18n("find.needsMentor", "Looking for a mentor"),
      },
      {
        name: "host",
        label: i18n("find.needsHost", "Looking for a host"),
      },
    ].map(
      // add icon from Roles collection to role object
      (role) => ({ ...role, icon: Roles.find((r) => r.type === role.name)?.icon }),
    );
  });
});

template.helpers({
  roles() {
    return Template.instance().roles;
  },

  roleClasses(role: Role) {
    const classes = [];
    const { findInstance } = Template.instance();
    const needsRoleFilter = findInstance.filter.get("needsRole");

    if (needsRoleFilter?.includes(role.name)) {
      classes.push("active");
    }

    return classes.join(" ");
  },

  filterCategoriesAttr() {
    const { findInstance } = Template.instance();
    return {
      categories: findInstance.filter.get("categories"),
      onAdd: (category: string) => {
        findInstance.filter.add("categories", category).done();
        findInstance.updateUrl();
      },
      onRemove: (category: string) => {
        findInstance.filter.remove("categories", category).done();
        findInstance.updateUrl();
      },
    };
  },
});

template.events({
  "click .js-filter-course-role"(event, instance) {
    const { findInstance } = instance;
    const filterName = instance.$(event.currentTarget as any).data("filter-name");

    findInstance.filter.toggle("needsRole", filterName).done();

    findInstance.updateUrl();
  },

  "mouseover .js-filter-course-role, mouseout .js-filter-course-role"(event, instance) {
    FilterPreview({
      property: "role",
      id: instance.$(event.currentTarget as any).data("filter-name"),
      activate: event.type === "mouseover",
    });
  },
});
