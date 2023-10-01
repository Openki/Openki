import { Meteor } from "meteor/meteor";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";

import { CourseMemberEntity, CourseModel } from "/imports/api/courses/courses";

import * as UserPrivilegeUtils from "/imports/utils/user-privilege-utils";

import "./template.html";

const Template = TemplateAny as TemplateStaticTyped<
  "removeFromTeamDropdown",
  { member: CourseMemberEntity; course: CourseModel }
>;

const template = Template.removeFromTeamDropdown;

template.helpers({
  isNotPriviledgedSelf() {
    const { member } = Template.instance().data;
    const notPriviledgedUser = !UserPrivilegeUtils.privilegedTo("admin");
    return member.user === Meteor.userId() && notPriviledgedUser;
  },
});
