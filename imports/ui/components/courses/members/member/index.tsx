import { Meteor } from "meteor/meteor";
import { i18n } from "/imports/startup/both/i18next";
import { ReactiveVar } from "meteor/reactive-var";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";

import * as Alert from "/imports/api/alerts/alert";
import { Roles } from "/imports/api/roles/roles";
import { Subscribe, Unsubscribe, Message, processChange } from "/imports/api/courses/subscription";
import { CourseMemberEntity, CourseModel } from "/imports/api/courses/courses";
import * as Users from "/imports/api/users/publications";

import { Editable } from "/imports/ui/lib/editable";
import { SubscriptionType } from "/imports/utils/ServerPublishBlaze";
import * as Tooltips from "/imports/utils/Tooltips";

import "/imports/ui/components/editable";
import "/imports/ui/components/participant/contact";
import "/imports/ui/components/profile-link";

import "./template.html";
import "./styles.scss";

const Template = TemplateAny as TemplateStaticTyped<
  "courseMember",
  { member: CourseMemberEntity; course: CourseModel },
  {
    user: ReactiveVar<SubscriptionType<(typeof Users)["details"]> | undefined>;
    editableMessage: Editable;
    subscribeToTeam: () => Subscribe | undefined;
    removeFromTeam: () => Unsubscribe | undefined;
  }
>;

const template = Template.courseMember;

template.onCreated(function () {
  const instance = this;
  const { course } = instance.data;

  instance.user = new ReactiveVar(undefined);

  instance.autorun(() => {
    const { member } = Template.currentData();
    instance.user.set(Users.details.subscribe(instance, member.user));
  });

  instance.editableMessage = new Editable(
    false,
    i18n("roles.message.placeholder", "My interests…"),
    undefined,
    {
      onSave: async (newMessage) => {
        const change = new Message(course, Meteor.user(), newMessage);
        await processChange(change);
      },
      onSuccess: () => {
        Alert.success(i18n("courseMember.messageChanged", "Your enroll-message has been changed."));
      },
    },
  );

  instance.autorun(() => {
    const { member } = Template.currentData();
    instance.editableMessage.setText(member.comment || "");
  });

  instance.subscribeToTeam = () => {
    const user = instance.user.get()?.();
    if (!user) return undefined; // Probably not loaded yet

    return new Subscribe(Template.currentData().course, user, "team", "interested");
  };

  instance.removeFromTeam = () => {
    const user = instance.user.get()?.();
    if (!user) return undefined; // Probably not loaded yet

    return new Unsubscribe(course, user, "team");
  };
});

template.helpers({
  ownUserMemberClass() {
    const { member } = Template.instance().data;
    if (member.user === Meteor.userId()) {
      return "is-own-user";
    }
    return "";
  },

  memberRoles() {
    const { member } = Template.instance().data;
    return member.roles.filter((role) => role !== "participant");
  },

  maySubscribeToTeam() {
    const change = Template.instance().subscribeToTeam?.();
    return change?.validFor(Meteor.user());
  },

  rolelistIcon(roletype: string) {
    if (roletype !== "participant") {
      return Roles.find((role) => role.type === roletype)?.icon || "";
    }
    return "";
  },

  rolelistIsProposal(roletype: string) {
    if (roletype !== "participant") {
      return Roles.find((role) => role.type === roletype)?.proposal;
    }
    return "";
  },

  editableMessage() {
    const { member } = Template.instance().data;
    const mayChangeComment = member.user === Meteor.userId();
    return mayChangeComment && Template.instance().editableMessage;
  },

  mayUnsubscribeFromTeam(label: string) {
    if (label !== "team") {
      return false;
    }
    const change = Template.instance().removeFromTeam();
    return change && change.validFor(Meteor.user());
  },

  showMemberComment() {
    const { member } = Template.instance().data;
    const mayChangeComment = member.user === Meteor.userId();
    return member.comment || mayChangeComment;
  },

  removeFromTeamDropdownAttr() {
    const instance = Template.instance();
    return {
      member: instance.data.member,
      onClick: async () => {
        const change = instance.removeFromTeam();
        if (!change) {
          throw new Error("Unexpected falsy: change");
        }
        await processChange(change);
      },
    };
  },
});

template.events({
  async "click .js-add-to-team-btn"(event, instance) {
    event.preventDefault();
    Tooltips.hide();
    const change = instance.subscribeToTeam();
    if (!change) {
      throw new Error("Unexpected falsy: change");
    }
    await processChange(change);
  },
});
