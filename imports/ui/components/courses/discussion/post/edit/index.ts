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
  {
    anon: ReactiveVar<boolean>;
    validComment: ReactiveVar<boolean>;
    commentText: ReactiveVar<string>;
    richtextPlaceholder: () => string;
  }
>;

const template = Template.postEdit;

template.onCreated(function () {
  const instance = this;

  instance.anon = new ReactiveVar(!instance.data.userId);
  instance.validComment = new ReactiveVar(!!instance.data.text.trim());
  instance.commentText = new ReactiveVar(instance.data.text);

  instance.richtextPlaceholder = () => {
    return Template.instance().data.parentId
      ? i18n("course.discussion.text_placeholder_answer", "Your answer")
      : i18n("course.discussion.text_placeholder", "Your comment");
  };
});

template.onRendered(function () {
  const instance = this;
  instance.$(".discussion-edit-title").trigger("select");
});

template.helpers({
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

  richtextAttr() {
    const instance = Template.instance();
    return {
      text: instance.data.text,
      placeholder: instance.richtextPlaceholder(),
      onChange(value: string) {
        instance.validComment.set(!!value);
        instance.commentText.set(value);
      },
    };
  },
});

template.events({
  change(_event, instance) {
    instance.anon.set(instance.$(".js-anon").prop("checked"));
  },

  async submit(event, instance) {
    event.stopImmediatePropagation();
    event.preventDefault();

    const comment = { title: instance.$(".js-post-title").val() as string } as
      | PostCommentFields
      | EditCommentFields;

    comment.text = instance.commentText.get();

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
