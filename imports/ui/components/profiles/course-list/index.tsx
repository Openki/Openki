import { Mongo } from "meteor/mongo";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";
import { _ } from "meteor/underscore";

import { CourseEntity, CourseModel, Courses } from "/imports/api/courses/courses";
import { RoleEntity, Roles } from "/imports/api/roles/roles";
import { UserModel } from "/imports/api/users/users";

import { ScssVars } from "/imports/ui/lib/scss-vars";

import "/imports/ui/components/courses/list";

import "./styles.scss";

export function CourseList() {
  return <div class="page-component page-component-seperated profile-courselist">
  {{#if isInvolved}}
    <h3 class="badge-title">
      {{#if ownProfile}}
        {{i18n 'users.courselist.myCourses' 'I am involved in the following courses'}}
      {{else}}
        {{i18n 'users.courselist.userCourses' '{NAME} is involved in the following courses' NAME=getName}}
      {{/if}}
    </h3>
    {{#if Template.subscriptionsReady}}
      <div>
        {{#each role in roles}}
          {{#if coursesByRoleCount role.type false}}
            <a class="badge role-label js-scroll" href="#{{role.type}}">
              <span class="{{role.icon}} fa-fw" aria-hidden="true"></span>
              {{roleShort role.type}}
              <span class="fa-solid fa-arrow-down fa-fw" aria-hidden="true"></span>
              {{coursesByRoleCount role.type}}
            </a>
          {{/if}}
        {{/each}}
      </div>
      {{#each role in roles}}
        {{#if coursesByRoleCount role.type false}}
          <h3 id="{{role.type}}">
            <div class="badge">
              <span class="{{role.icon}} fa-fw" aria-hidden="true"></span>
            </div>
            {{#if ownProfile}}
              {{i18n (roleMyList role.type)}}
            {{else}}
              {{i18n (roleUserList role.type) NAME=user.getDisplayName}}
            {{/if}}
          </h3>
          {{> courseList courses=(coursesByRole role.type false) small=true}}
        {{/if}}
      {{/each}}
      {{#each role in roles}}
        {{#if showArchived role}}
          {{#if coursesByRoleCount role.type true}}
            <h3 id="{{role.type}}_archived">
              <div class="badge is-archived">
                <span class="{{role.icon}} fa-fw" aria-hidden="true"></span>
              </div>
              {{#if ownProfile}}
                {{i18n (roleMyListPast role.type)}}
              {{else}}
                {{i18n (roleUserListPast role.type) NAME=user.getDisplayName}}
              {{/if}}
            </h3>
            {{> courseList courses=(coursesByRole role.type true) small=true}}
          {{/if}}
        {{/if}}
      {{/each}}
    {{else}}
      {{> loadingPage}}
    {{/if}}
  {{/if}}
</div>
}

const Template = TemplateAny as TemplateStaticTyped<
  "usersCourselist",
  {
    user: UserModel;
    ownProfile: boolean;
  },
  {
    coursesByRole: (role: string, archived: boolean) => Mongo.Cursor<CourseEntity, CourseModel>;
  }
>;

const template = Template.usersCourselist;

template.onCreated(function () {
  const instance = this;
  const id = instance.data.user._id;

  instance.subscribe("Courses.findFilter", {
    userInvolved: id,
    archived: false,
  });
  instance.subscribe("Courses.findFilter", {
    userInvolved: id,
    archived: true,
  });

  instance.coursesByRole = (role: string, archived: boolean) =>
    Courses.find({
      members: {
        $elemMatch: {
          user: id,
          roles: role,
        },
      },
      archived: archived ? { $eq: true } : { $ne: true },
    });
});

Template.usersCourselist.helpers({
  roles() {
    return _.clone(Roles).reverse();
  },

  coursesByRoleCount(role: string, archived: boolean) {
    return Template.instance().coursesByRole(role, archived).count();
  },

  coursesByRole(role: string, archived: boolean) {
    return Template.instance().coursesByRole(role, archived);
  },

  roleUserList(role: string) {
    return `roles.${role}.userList`;
  },

  roleUserListPast(role: string) {
    return `roles.${role}.userList.past`;
  },

  roleMyList(role: string) {
    return `roles.${role}.myList`;
  },

  roleMyListPast(role: string) {
    return `roles.${role}.myList.past`;
  },

  isInvolved() {
    const userId = Template.currentData().user._id;
    return (
      Courses.findFilter({ userInvolved: userId, archived: false }, 1).count() > 0 ||
      Courses.findFilter({ userInvolved: userId, archived: true }, 1).count() > 0
    );
  },
  showArchived(role: RoleEntity) {
    return role.type === "team";
  },
});

Template.usersCourselist.events({
  "click .js-scroll"(event) {
    const roleLabel = event.currentTarget;
    const rolePosition = $(roleLabel.getAttribute("href") || "").offset()?.top || 0;
    // subtract the amount of pixels of the height of the navbar
    $("html, body").animate({ scrollTop: rolePosition - ScssVars.navbarHeight });
    event.preventDefault();
  },
});
