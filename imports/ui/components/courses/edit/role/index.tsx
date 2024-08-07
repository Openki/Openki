import { ReactiveVar } from "meteor/reactive-var";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";
import { Meteor } from "meteor/meteor";
import { CourseMemberEntity } from "/imports/api/courses/courses";
import { RoleEntity } from "/imports/api/roles/roles";

import { hasRoleUser } from "/imports/utils/course-role-utils";

import "./template.html";

const Template = TemplateAny as TemplateStaticTyped<
  "courseEditRole",
  { selected: string[]; role: RoleEntity; members: CourseMemberEntity[] },
  { checked: ReactiveVar<boolean> }
>;

const template = Template.courseEditRole;
template.onCreated(function () {
  this.checked = new ReactiveVar(false);
});

template.onRendered(function () {
  const { data } = this;
  const selectedRoles = data.selected;

  if (selectedRoles) {
    this.checked.set(selectedRoles.includes(data.role.type));
  }
});

template.helpers({
  roleDescription() {
    return `roles.${Template.currentData().role.type}.description`;
  },

  roleSubscription() {
    return `roles.${Template.currentData().role.type}.subscribe`;
  },

  checkRole() {
    const instance = Template.instance();
    return instance.checked.get() ? "checked" : null;
  },

  hasRole() {
    const data = Template.currentData();
    return data.members && hasRoleUser(data.members, data.role.type, Meteor.userId())
      ? "checked"
      : null;
  },
});

template.events({
  "change .js-check-role"(_event, instance) {
    instance.checked.set(instance.$(".js-check-role").prop("checked"));
  },
});
