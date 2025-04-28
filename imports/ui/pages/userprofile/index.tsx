import { Router } from "meteor/iron:router";
import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { ReactiveDict } from "meteor/reactive-dict";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";

import * as Alert from "/imports/api/alerts/alert";
import { CourseModel, Courses } from "/imports/api/courses/courses";
import { GroupEntity } from "/imports/api/groups/groups";
import * as GroupsMethods from "/imports/api/groups/methods";
import { UserModel } from "/imports/api/users/users";
import * as usersMethods from "/imports/api/users/methods";
import * as emailMethods from "/imports/api/emails/methods";

import { PleaseLogin } from "/imports/ui/lib/please-login";
import { i18n } from "/imports/startup/both/i18next";
import * as Metatags from "/imports/utils/metatags";
import { checkContribution } from "/imports/utils/checkContribution";
import * as Tooltips from "/imports/utils/Tooltips";

import "/imports/ui/components/profiles/course-list";
import "/imports/ui/components/profiles/verify-email";
import "/imports/ui/components/avatar";
import "/imports/ui/components/send-message";
import type { Data as SendMessageData } from "/imports/ui/components/send-message";

import "./template.html";

interface UserProfilePageData {
  user: UserModel;
  alterPrivileges: boolean;
  privileges: string[];
  inviteGroups: Mongo.Cursor<GroupEntity>;
  showPrivileges: boolean;
}

const Template = TemplateAny as TemplateStaticTyped<
  "userprofilePage",
  UserProfilePageData,
  { state: ReactiveDict<{ verifyUserDelete: boolean }>; coursesCreatedBy(): CourseModel[] }
>;

const template = Template.userprofilePage;

template.onCreated(function () {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const instance = this;

  instance.autorun(() => {
    const { user } = Template.currentData();
    const title = i18n("profile.windowtitle", "Profile of {USER}", { USER: user.getDisplayName() });
    Metatags.setCommonTags(title);
  });

  instance.busy(false);
  const userId = instance.data.user._id;

  instance.state = new ReactiveDict(undefined, { verifyUserDelete: false });

  instance.subscribe("Courses.findFilter", { createdby: userId });
  instance.coursesCreatedBy = () => {
    return Courses.findFilter({ createdby: userId }).fetch();
  };
});

template.helpers({
  /**
   * whether userprofile is for the logged-in user
   */
  ownuser() {
    return Template.instance().data.user._id === Meteor.userId();
  },

  hasContributed() {
    return checkContribution(Template.instance().data.user.contribution);
  },

  allowPrivateMessages() {
    return Template.instance().data.user.allowPrivateMessages || Meteor.user()?.privileged("admin");
  },

  groupMember(group: GroupEntity, user: UserModel) {
    return !!(user && group?.members?.some((m) => m.user === user._id));
  },

  showInviteGroups() {
    const { data } = Template.instance();

    if (data.user._id === Meteor.userId()) {
      return false;
    }
    return data.inviteGroups?.count && data.inviteGroups.count() > 0;
  },

  showSettings() {
    const { data } = Template.instance();

    if (data.showPrivileges) {
      return true;
    }

    if (data.user._id === Meteor.userId()) {
      return false;
    }

    return data.inviteGroups?.count && data.inviteGroups.count() > 0;
  },

  sendMessageAttr(): SendMessageData {
    const { data } = Template.instance();

    return {
      placeholder: i18n("profile.mail.placeholder", "Hi {USER}. I wanted to tell you…", {
        USER: data.user.username,
      }),
      onSend: async (message, options) => {
        await emailMethods.sendPrivateMessage(data.user._id, message, options);
      },
    };
  },

  numberOfCoursesAffectedByDelete() {
    return Template.instance().coursesCreatedBy().length;
  },
  numberOfInterestedAffectedByDelete() {
    return Template.instance()
      .coursesCreatedBy()
      .reduce((accumulator, currentValue) => accumulator + currentValue.interested, 0);
  },
  numberOfFutureEventsAffectedByDelete() {
    return Template.instance()
      .coursesCreatedBy()
      .reduce((accumulator, currentValue) => accumulator + currentValue.futureEvents, 0);
  },
});

template.events({
  async "click .js-has-contributed"(_event, instance) {
    const { data } = instance;
    try {
      await usersMethods.setHasContributed(data.user._id);

      Alert.success(i18n("profile.setHasContributed.alert", "User has contributed"));
    } catch (err) {
      Alert.serverError(
        err,
        i18n("profile.setHasContributed.error", "Unable to set user has contributed."),
      );
    }
  },

  async "click .js-unset-has-contributed"(_event, instance) {
    const { data } = instance;
    try {
      await usersMethods.unsetHasContributed(data.user._id);

      Alert.success(i18n("profile.unsetHasContributed.alert", "Unset user has contributed"));
    } catch (err) {
      Alert.serverError(
        err,
        i18n("profile.unsetHasContributed.error", "Unable to unset user has contributed."),
      );
    }
  },

  async "click .js-give-admin"(_event, instance) {
    const { data } = instance;
    try {
      await usersMethods.addPrivilege(data.user._id, "admin");

      Alert.success(i18n("privilege.addedAdmin", "Granted admin privilege"));
    } catch (err) {
      Alert.serverError(err, i18n("privilege.addedAdmin.error", "Unable to add privilege"));
    }
  },

  async "click .js-remove-privilege-btn"(event, instance) {
    const { data } = instance;
    const priv = instance.$(event.target as any).data("priv");
    try {
      await usersMethods.removePrivilege(data.user._id, priv);

      Alert.success(i18n("privilege.removed", "Removed privilege"));
    } catch (err) {
      Alert.serverError(err, i18n("privilege.removed.error", "Unable to remove privilege"));
    }
  },

  async "click .js-draft-into-group"(this: GroupEntity, _event, instance) {
    const { _id: groupId, name } = this;
    const { data } = instance;
    const userId = data.user._id;

    try {
      await GroupsMethods.updateMembership(userId, groupId, true);

      Alert.success(i18n("profile.group.drafted", "Added to group {NAME}", { NAME: name }));
    } catch (err) {
      Alert.serverError(
        err,
        i18n("profile.group.drafted.error", "Unable to draft user into group"),
      );
    }
  },

  async "click .js-group-expel-btn"(this: GroupEntity, _event, instance) {
    Tooltips.hide();

    const { _id: groupId, name } = this;
    const { data } = instance;
    const userId = data.user._id;

    try {
      await GroupsMethods.updateMembership(userId, groupId, false);

      Alert.success(i18n("profile.group.expelled", "Expelled from group {NAME}", { NAME: name }));
    } catch (err) {
      Alert.serverError(
        err,
        i18n("profile.group.expelled.error", "Unable to expel user from group"),
      );
    }
  },

  "click .js-verify-user-delete-collapse"() {
    const instance = Template.instance();
    instance.state.set("verifyUserDelete", !instance.state.get("verifyUserDelete"));
  },

  async "click .js-verify-user-delete-confirm"(_event, instance) {
    instance.busy("deleting");
    PleaseLogin(instance, async () => {
      const reason = instance.$(".js-reason").val() as string;

      if (reason.length < 4) {
        Alert.error(i18n("profile.admin.remove.reason.longertext", "longer text please"));
        instance.busy(false);
        return;
      }

      const userId = instance.data.user._id;

      try {
        await usersMethods.adminRemove(userId, reason, { courses: true });
        Alert.success(i18n("profile.account.deleted", "The account has been deleted"));
        Router.go("users");
      } finally {
        instance.busy(false);
      }
    });
  },
});

export function UserprofilePage(){
  return  <div class="container mw-md">
  <div class="page-component">
    <div class="row g-3">
      <div class="col-3">
        {{> avatar userId=user._id className="profile-avatar"}}
      </div>

      <div class="col-9">
        <h1 class="mt-4">
          {{i18n 'profile.users_profile_page' "{NAME}'s Profile" NAME=this.user.getDisplayName}}
          {{contribution this.user._id}}
        </h1>
        {{#if ownuser}}
          <em>({{i18n 'profile.its_you' "It's you."}})</em>
        {{else}}
          {{#if alterPrivileges}}
            {{#if PublicSettings.contribution}}
              {{#unless hasContributed}}
                <button type="button" class="btn btn-primary js-has-contributed">
                  <i class="{{PublicSettings.contribution.icon}}" aria-hidden="true"></i>
                  {{i18n 'profile.setHasContributed.button' 'Mark this user has contributed'}}
                </button>
              {{else}}
                <button type="button" class="btn btn-secondary js-unset-has-contributed">
                  {{i18n 'profile.unsetHasContributed.button' 'Remove this user has contributed'}}
                </button>
              {{/unless}}
            {{/if}}
          {{/if}}
        {{/if}}

        <p class="profile-description">{{{this.user.description}}}</p>

        {{#if ownuser}}
          <a class="btn btn-primary" href="{{pathFor 'profile'}}">
            <span class="fa-solid fa-gears fa-fw" aria-hidden="true"></span>
            {{i18n 'profile.preferenceslink' "Account settings"}}
          </a>
        {{else}}
          {{#if allowPrivateMessages}}
            {{> sendMessage sendMessageAttr}}
          {{/if}}
        {{/if}}
      </div>
    </div>
  </div>
  {{#if showSettings}}
    <div class="page-component page-component-seperated">
      <div class="row gap-3 mb-3">
        {{#if showPrivileges}}
          <div class="col-md">
            <h3>
              <span class="fa-solid fa-gear fa-fw" aria-hidden="true"></span>
              {{i18n 'privileges.title' 'Edit Privileges'}}
            </h3>
            <div class="list-group">
              {{#if privileges.admin}}
                <li class="list-group-item list-group-item-success">
                  {{#if alterPrivileges}}
                    <button type="button"
                            class="js-remove-privilege-btn btn-close btn-close-white float-end"
                            data-bs-toggle="tooltip"
                            data-bs-title="{{i18n 'privilege.remove' 'Remove privilege' attr=true}}"
                            data-priv="admin">
                    </button>
                  {{/if}}
                  {{i18n 'privilege.has.admin' 'Administrator privileges granted'}}
                </li>
              {{else}}
                {{#if alterPrivileges}}
                  <button type="button"
                          class="list-group-item-action list-group-item-secondary btn js-give-admin">
                    {{i18n 'privilege.add.admin' 'Grant administrator privileges'}}
                  </button>
                {{/if}}
              {{/if}}
            </div>
          </div>
        {{/if}}
        {{#if showInviteGroups}}
          <div class="col-md">
            <h3>
              <span class="fa-solid fa-gear fa-fw" aria-hidden="true"></span>
              {{i18n 'userprofile.groups.header' 'Edit groups'}}
            </h3>
            <div class="list-group">
              {{#each inviteGroups}}
                {{#if groupMember this ../user}}
                  <li class="list-group-item list-group-item-success">
                    <button type="button"
                            class="js-group-expel-btn btn-close btn-close-white float-end"
                            data-bs-toggle="tooltip"
                            data-bs-title="{{i18n 'profile.group.expel' 'Expel from group {GROUPNAME}' GROUPNAME=this.name attr=true}}">
                    </button>
                    {{i18n 'profile.group.member' 'Member of group'}}
                    <span class="group">{{name}}</span>
                  </li>
                {{else}}
                  <button type="button"
                          class="js-draft-into-group list-group-item list-group-item-action list-group-item-secondary">
                    {{i18n 'profile.group.draft' 'Draft into group'}}
                    {{name}}
                  </button>
                {{/if}}
              {{/each}}
            </div>
          </div>
        {{/if}}
      </div>
    </div>
  {{/if}}
  {{> usersCourselist user=this.user ownProfile=false}}

  {{#if alterPrivileges}}
    <h3 class="text-danger">{{i18n 'profile.account.delete.header' 'Is this a spammer?'}}
    </h3>
    {{#unless (state 'verifyUserDelete')}}
      {{> buttonDelete event="js-verify-user-delete-collapse"}}
    {{else}}
      <div class="border border-danger text-danger p-3">
        <p>{{i18n 'profile.account.reallydelete' 'Remove the user profile "{NAME}" permanently? {COURSES, number} Courses created by this user (with {INTERESTED, number} Participants and {EVENTS, number} upcoming events) will also be removed.' NAME=this.user.getDisplayName COURSES=numberOfCoursesAffectedByDelete INTERESTED=numberOfInterestedAffectedByDelete EVENTS=numberOfFutureEventsAffectedByDelete}}
        </p>
        <div class="mb-3">
          <textarea class='form-control js-reason'
                    placeholder="{{i18n 'profile.account.reason.placeholder' 'Reason for deleting this user' attr=true}}"></textarea>
        </div>
        <div class="form-actions">
          {{> buttonDeleteConfirm
          event="js-verify-user-delete-confirm"
          textIdle=(i18n 'profile.account.delete.confirm.button' 'Delete user and all his traces')
          textBusy=(i18n 'profile.account.delete.confirm.button.busy' 'Deleting profile…')
        }}
          {{> buttonCancel event="js-verify-user-delete-collapse"}}
        </div>
      </div>
    {{/unless}}
  {{/if}}
</div>
}
