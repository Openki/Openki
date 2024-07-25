import { Router } from "meteor/iron:router";
import { i18n } from "/imports/startup/both/i18next";
import { ReactiveVar } from "meteor/reactive-var";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";

import * as Alert from "/imports/api/alerts/alert";
import { GroupModel, GroupEntity, Groups, GroupMemberEntity } from "/imports/api/groups/groups";
import * as GroupsMethods from "/imports/api/groups/methods";
import { Users } from "/imports/api/users/users";

import * as UserPrivilegeUtils from "/imports/utils/user-privilege-utils";
import { userSearchPrefix } from "/imports/utils/user-search-prefix";

import "/imports/ui/components/buttons";
import "/imports/ui/components/editable-image";
import "/imports/ui/components/profile-link";
import "/imports/ui/components/delete-confirm";
import type { UploadImage, Data as EditableImageData } from "/imports/ui/components/editable-image";

import "./template.html";
import "./styles.scss";

const Template = TemplateAny as TemplateStaticTyped<
  "groupSettings",
  {
    group: GroupModel;
  },
  { userSearch: ReactiveVar<string> }
>;

const template = Template.groupSettings;

template.onCreated(function () {
  const instance = this;

  instance.busy(false);

  instance.userSearch = new ReactiveVar("");

  instance.autorun(() => {
    const search = instance.userSearch.get();
    if (search.length > 0) {
      instance.subscribe("userSearch", search);
    }
  });
});

template.helpers({
  isCurrentUser(userId: string) {
    return Meteor.userId() === userId;
  },

  foundUsers(group: GroupEntity) {
    const instance = Template.instance();

    const search = instance.userSearch.get();
    if (search === "") {
      return false;
    }

    return userSearchPrefix(search, { exclude: group.members.map((m) => m.user), limit: 30 });
  },

  logoFileUploadArgs(): EditableImageData {
    const instance = Template.instance();
    return {
      thumbnail: { src: instance.data.group?.publicLogoUrl?.(), maxSize: 150 },
      maxSize: 100,
      async onUpload(file: UploadImage) {
        const parentInstance = instance.parentInstance() as any; // Not available in callback

        instance.busy("saving");

        const groupId = instance.data.group._id;
        try {
          await GroupsMethods.updateLogo(groupId, file);
          const groupName = Groups.findOne(groupId)?.name;
          Alert.success(
            i18n(
              "groupSettings.group.logo.updated",
              'Changes to the "{GROUP}" group settings have been saved.',
              { GROUP: groupName },
            ),
          );
          parentInstance.editingSettings.set(false);
        } catch (err) {
          Alert.serverError(
            err,
            i18n("groupSettings.group.logo.updated.error", "Could not save settings"),
          );
        } finally {
          instance.busy(false);
        }
      },
      onDelete: instance.data.group?.logoUrl
        ? async function () {
            const parentInstance = instance.parentInstance() as any; // Not available in callback

            instance.busy("deleting");

            const groupId = instance.data.group._id;
            try {
              await GroupsMethods.deleteLogo(groupId);
              const groupName = Groups.findOne(groupId)?.name;
              Alert.success(
                i18n(
                  "groupSettings.group.logo.removed",
                  'Changes to the "{GROUP}" group settings have been saved.',
                  { GROUP: groupName },
                ),
              );
              parentInstance.editingSettings.set(false);
            } catch (err) {
              Alert.serverError(
                err,
                i18n("groupSettings.group.logo.removed.error", "Could not save settings"),
              );
            } finally {
              instance.busy(false);
            }
          }
        : undefined,
    };
  },

  kioskEventURL(group: GroupEntity) {
    return Router.url("kioskEvents", {}, { query: { group: group._id } });
  },
  timetableURL(group: GroupEntity) {
    return Router.url("timetable", {}, { query: { group: group._id } });
  },
  scheduleURL(group: GroupEntity) {
    return Router.url("frameSchedule", {}, { query: { group: group._id } });
  },
  frameEventsURL(group: GroupEntity) {
    return Router.url("frameEvents", {}, { query: { group: group._id } });
  },
  frameWeekURL(group: GroupEntity) {
    return Router.url("frameWeek", {}, { query: { group: group._id } });
  },
  frameCalendarURL(group: GroupEntity) {
    return Router.url("frameCalendar", {}, { query: { group: group._id } });
  },
  frameListURL(group: GroupEntity) {
    return Router.url("frameCourselist", {}, { query: { group: group._id } });
  },
  isAdmin() {
    return UserPrivilegeUtils.privilegedTo("admin");
  },
  deleteConfirmAttr() {
    const { group } = Template.instance().data;
    return {
      confirmText: i18n(
        "group.reallydelete",
        "Please confirm that you would like to delete {GROUP}. This cannot be undone.",
        { GROUP: group.name },
      ),
      confirmButton: i18n("group.delete.confirm.button", "Delete {GROUP}", { GROUP: group.name }),
      onRemove: async () => {
        const groupId = group._id;
        await GroupsMethods.remove(groupId);

        Alert.success(i18n("group.deleted", "Group has been deleted"));
      },
      busyButton: i18n("group.delete.confirm.button.busy", "Deleting group…"),
    };
  },
});

template.events({
  "keyup .js-search-users"(_event, instance) {
    instance.userSearch.set(instance.$(".js-search-users").val() as string);
  },

  async "click .js-member-add-btn"(this: { _id: string }) {
    const memberId = this._id;
    const groupId = Router.current().params._id as string;
    try {
      await GroupsMethods.updateMembership(memberId, groupId, true);
      const memberName = Users.findOne(memberId)?.getDisplayName();
      const groupName = Groups.findOne(groupId)?.name;
      Alert.success(
        i18n("groupSettings.memberAdded", '"{MEMBER}" has been added to the "{GROUP}" group', {
          MEMBER: memberName,
          GROUP: groupName,
        }),
      );
    } catch (err) {
      Alert.serverError(err, i18n("groupSettings.memberAdded.error", "Could not add member"));
    }
  },

  async "click .js-member-remove-btn"(this: GroupMemberEntity) {
    const memberId = this.user;
    const groupId = Router.current().params._id as string;
    try {
      await GroupsMethods.updateMembership(memberId, groupId, false);
      const memberName = Users.findOne(memberId)?.getDisplayName();
      const groupName = Groups.findOne(groupId)?.name;
      Alert.success(
        i18n(
          "groupSettings.memberRemoved",
          '"{MEMBER}" has been removed from the "{GROUP}" group',
          { MEMBER: memberName, GROUP: groupName },
        ),
      );
    } catch (err) {
      Alert.serverError(err, i18n("groupSettings.memberRemoved.error", "Could not remove member"));
    }
  },

  async "click .js-member-toggle-notify-btn"() {
    const groupId = Router.current().params._id as string;
    try {
      await GroupsMethods.toggleMemberNotify(groupId);
    } catch (err) {
      Alert.serverError(
        err,
        i18n("groupSettings.memberToggleNotify.error", "Could not change members notify setting."),
      );
    }
  },

  "click .js-group-edit-cancel"(_event, instance) {
    (instance.parentInstance() as any).editingSettings.set(false);
  },
});
