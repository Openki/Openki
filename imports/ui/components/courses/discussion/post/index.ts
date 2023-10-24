import { Meteor } from "meteor/meteor";
import { ReactiveVar } from "meteor/reactive-var";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";

import {
  CourseDiscussionEnity,
  CourseDiscussions,
} from "/imports/api/course-discussions/course-discussions";

import "/imports/ui/components/buttons";
import "/imports/ui/components/richtext";

import "./show";
import "./edit";
import "./profile-link";
import "./profile-icon";

import "./template.html";
import "./styles.scss";

const Template = TemplateAny as TemplateStaticTyped<
  "post",
  { post: CourseDiscussionEnity & { new?: true }; edit?: boolean; onCancel?: () => void },
  { isParent: boolean; editing: ReactiveVar<boolean>; limit: ReactiveVar<number> }
>;

const template = Template.post;

template.onCreated(function () {
  const instance = this;
  const { post, edit } = instance.data;

  instance.busy(false);

  instance.isParent = !post.new && !post.parentId;
  instance.editing = new ReactiveVar(!!edit);

  instance.autorun(() => {
    const { edit: edit2 } = Template.currentData();
    instance.editing = new ReactiveVar(!!edit2);
  });

  instance.limit = new ReactiveVar(2);
});

template.helpers({
  editing() {
    return Template.instance().editing.get();
  },

  responses() {
    // Note that the 'discussion' subscription from the 'discussion' template
    // covers responses as well
    const instance = Template.instance();
    const { post } = instance.data;

    if (!instance.isParent) {
      return false;
    }

    const replies = CourseDiscussions.find(
      { parentId: post._id },
      { sort: { time_created: 1 } },
    ).fetch();

    const limit = instance.limit.get();
    return limit ? replies.slice(-limit) : replies;
  },

  notAllResponsesShown() {
    const instance = Template.instance();
    const { post } = instance.data;

    if (!instance.isParent) {
      return false;
    }

    const limit = instance.limit.get();
    const count = CourseDiscussions.find({ parentId: post._id }, { limit: limit + 1 }).count();

    return limit && count > limit;
  },

  allowResponse() {
    return Template.instance().isParent;
  },

  newResponse() {
    const instance = Template.instance();
    const { post } = instance.data;
    if (post.parentId) {
      return false;
    }
    return {
      new: true,
      parentId: post._id,
      courseId: post.courseId,
      userId: Meteor.userId(),
      text: "",
    };
  },

  postShowAttr() {
    const instance = Template.instance();
    return {
      post: instance.data.post,
      onEdit: () => {
        instance.editing.set(true);
      },
    };
  },
});

template.events({
  "click .js-show-previous-replies"(_event, instance) {
    instance.limit.set(0);
  },

  "click .js-discussion-cancel"() {
    const instance = Template.instance();
    instance.editing.set(false);
    instance.data.onCancel?.();
  },
});
