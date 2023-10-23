import { Meteor } from "meteor/meteor";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";
import moment from "moment";

import { Courses } from "/imports/api/courses/courses";
import { CourseDiscussionEnity } from "/imports/api/course-discussions/course-discussions";
import * as CourseDiscussionsMethods from "/imports/api/course-discussions/methods";
import * as Alert from "/imports/api/alerts/alert";

import * as CourseDiscussionUtils from "/imports/utils/course-discussion-utils";
import * as Tooltips from "/imports/utils/Tooltips";

import { routerAutoscroll } from "/imports/ui/lib/router-autoscroll";

import "/imports/ui/components/buttons";
import "/imports/ui/components/richtext";
import "/imports/ui/components/avatar";
import "/imports/ui/components/profile-link";

import "./remove-dropdown";

import "./template.html";
import { i18n } from "/imports/startup/both/i18next";

const Template = TemplateAny as TemplateStaticTyped<"postShow", CourseDiscussionEnity>;

const template = Template.postShow;

template.helpers({
  postClasses() {
    const post = Template.instance().data;

    const classes = [];

    classes.push(post.parentId ? "discussion-comment" : "discussion-post");
    if (this.saving) {
      classes.push("is-saving");
    }

    return { class: classes.join(" ") };
  },

  mayEdit() {
    const post = Template.instance().data;
    return CourseDiscussionUtils.mayEditPost(Meteor.user() ?? undefined, post);
  },

  mayDelete() {
    const post = Template.instance().data;
    const course = Courses.findOne(post.courseId);
    if (!course) {
      throw new Error("Unexpected falsy: course");
    }
    return CourseDiscussionUtils.mayDeletePost(Meteor.user() ?? undefined, course, post);
  },

  hasBeenEdited() {
    const post = Template.instance().data;
    return moment(post.time_updated).isAfter(post.time_created);
  },

  removeDropdownAttr() {
    const post = Template.instance().data;
    return {
      async onRemove() {
        Tooltips.hide();

        try {
          await CourseDiscussionsMethods.deleteComment(post._id);
          Alert.success(i18n("discussionPost.deleted", "Comment deleted."));
        } catch (err) {
          Alert.serverError(err, i18n("discussionPost.deleted.error", "Could not delete comment"));
        }
      },
    };
  },
});

template.events({
  "notifyAll .js-discussion-edit"(_event, instance) {
    instance.$(".js-discussion-edit").trigger("click");
    (instance.parentInstance(2) as any).notifyAll.set(true);
    window.location.hash = "#discussion";
    routerAutoscroll.scheduleScroll();
  },

  "click .js-discussion-edit"(event, instance) {
    Tooltips.hide();
    event.stopImmediatePropagation();
    (instance.parentInstance() as any).editing.set(true);
  },
});
