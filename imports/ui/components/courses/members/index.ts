import { Meteor } from "meteor/meteor";
import { ReactiveVar } from "meteor/reactive-var";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";

import { CourseModel } from "/imports/api/courses/courses";

import * as UserPrivilegeUtils from "/imports/utils/user-privilege-utils";

import "/imports/ui/components/editable";
import "/imports/ui/components/participant/contact";
import "/imports/ui/components/profile-link";

import "./member";
import "./remove-from-team-dropdown";

import "./template.html";
import "./styles.scss";

const Template = TemplateAny as TemplateStaticTyped<
  "courseMembers",
  CourseModel | undefined,
  { increaseBy: number; membersDisplayLimit: ReactiveVar<number> }
>;

const template = Template.courseMembers;

template.onCreated(function () {
  this.increaseBy = 10;
  this.membersDisplayLimit = new ReactiveVar(this.increaseBy);
});

template.helpers({
  howManyEnrolled() {
    const course = Template.instance().data;
    if (!course) {
      return undefined;
    }
    return course.members.length;
  },

  canNotifyAll() {
    const user = Meteor.user();

    if (UserPrivilegeUtils.privileged(user, "admin")) {
      return true;
    }

    const course = Template.instance().data;

    return !!(
      course?.userHasRole(user?._id, "team") ||
      user?.groups.some((g) => course?.groupOrganizers.includes(g))
    );
  },

  ownUserMember() {
    const course = Template.instance().data;
    if (!course) {
      return undefined;
    }
    return course.members.find((member) => member.user === Meteor.userId());
  },

  sortedMembers() {
    const course = Template.instance().data;
    if (!course) {
      return undefined;
    }
    const { members } = course;
    members.sort((a, b) => {
      const aRoles = a.roles.filter((role) => role !== "participant");
      const bRoles = b.roles.filter((role) => role !== "participant");
      return bRoles.length - aRoles.length;
    });
    // check if logged-in user is in members and if so put him on top
    const userId = Meteor.userId();
    if (userId && members.some((member) => member.user === userId)) {
      const userArrayPosition = members.findIndex((member) => member.user === userId);
      const currentMember = members[userArrayPosition];
      // remove current user form array and readd him at index 0
      members.splice(userArrayPosition, 1); // remove
      members.splice(0, 0, currentMember); // readd
    }
    return members.slice(0, Template.instance().membersDisplayLimit.get());
  },

  limited() {
    const membersDisplayLimit = Template.instance().membersDisplayLimit.get();
    return membersDisplayLimit && this.members.length > membersDisplayLimit;
  },
});

template.events({
  "click .js-contact-members"() {
    document.getElementById("discussion")?.dispatchEvent(new Event("notifyAll"));
  },

  "click .js-show-more-members"(_e, instance) {
    const { membersDisplayLimit } = instance;
    membersDisplayLimit.set(membersDisplayLimit.get() + instance.increaseBy);
  },
});
