import { Meteor } from "meteor/meteor";
import { i18n } from "/imports/startup/both/i18next";
import { ReactiveVar } from "meteor/reactive-var";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";
import moment from "moment";

import { Courses } from "/imports/api/courses/courses";
import { CourseDiscussionEnity } from "/imports/api/course-discussions/course-discussions";
import * as CourseDiscussionsMethods from "/imports/api/course-discussions/methods";
import { EditCommentFields, PostCommentFields } from "/imports/api/course-discussions/methods";
import * as Alert from "/imports/api/alerts/alert";

import * as UserPrivilegeUtils from "/imports/utils/user-privilege-utils";

import "/imports/ui/components/buttons";
import "/imports/ui/components/richtext";
import "/imports/ui/components/avatar";
import "/imports/ui/components/profile-link";

import "./template.html";

const Template = TemplateAny as TemplateStaticTyped<
  "postEdit",
  CourseDiscussionEnity & { new?: true },
  { anon: ReactiveVar<boolean>; validComment: ReactiveVar<boolean> }
>;

const template = Template.postEdit;

template.onCreated(function () {
  const instance = this;

  instance.anon = new ReactiveVar(!instance.data.userId);
  instance.validComment = new ReactiveVar(!!instance.data.text.trim());
});

template.onRendered(function () {
  const instance = this;
  instance.$(".discussion-edit-title").trigger("select");
});

template.helpers({
  richtextPlaceholder() {
    return Template.instance().data.parentId
      ? i18n("course.discussion.text_placeholder_answer", "Your answer")
      : i18n("course.discussion.text_placeholder", "Your comment");
  },

  postClass() {
    return this.parentId ? "discussion-comment" : "discussion-post";
  },

  showUserId() {
    return !this.new || !Template.instance().anon.get();
  },

  anonChecked() {
    if (Template.instance().anon.get()) {
      return { checked: 1 };
    }
    return {};
  },

  anonDisabled() {
    if (Meteor.userId()) {
      return {};
    }
    return { disabled: 1 };
  },

  enableWhenValid() {
    return Template.instance().validComment.get() ? "" : "disabled";
  },

  hasBeenEdited() {
    const post = Template.instance().data;
    return moment(post.time_updated).isAfter(post.time_created);
  },

  notifyAllChecked() {
    if (!this.new) {
      return {};
    }
    if (this.notifyAll) {
      return { checked: 1 };
    }
    return {};
  },

  canNotifyAll() {
    if (Template.instance().anon.get()) {
      return false;
    }

    const user = Meteor.user();

    if (UserPrivilegeUtils.privileged(user, "admin")) {
      return true;
    }

    const course = Courses.findOne(this.courseId);

    return !!(
      course?.userHasRole(user?._id, "team") ||
      user?.groups.some((g) => course?.groupOrganizers.includes(g))
    );
  },
});

template.events({
  "keyup .js-post-text, change .js-post-text"(_event, instance) {
    const edited = instance.$(".js-post-text").text().trim();
    instance.validComment.set(!!edited);
  },

  change(_event, instance) {
    instance.anon.set(instance.$(".js-anon").prop("checked"));
  },

  async submit(event, instance) {
    event.stopImmediatePropagation();
    event.preventDefault();

    const comment = { title: instance.$(".js-post-title").val() as string } as
      | PostCommentFields
      | EditCommentFields;

    const $postText = instance.$(".js-post-text");
    if ($postText.text().trim()) {
      comment.text = $postText.html();
    }

    (instance.parentInstance() as any).editing.set(false);
    instance.busy("saving");

    try {
      if (instance.data.new) {
        const postComment = comment as PostCommentFields;
        postComment.courseId = instance.data.courseId;

        if (instance.data.parentId) {
          postComment.parentId = instance.data.parentId;
        }

        postComment.anon = instance.$(".js-anon").prop("checked");
        postComment.notifyAll = instance.$(".js-notify-all").prop("checked") || false;

        await CourseDiscussionsMethods.postComment(postComment);
      } else {
        const editComment = comment as EditCommentFields;
        editComment._id = instance.data._id;
        await CourseDiscussionsMethods.editComment(editComment);
      }
    } catch (err) {
      Alert.serverError(
        err,
        i18n("courseDiscussions.postComment.error", "Posting your comment went wrong"),
      );
    } finally {
      instance.busy(false);
    }
  },
});
