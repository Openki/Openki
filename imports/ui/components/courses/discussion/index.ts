import { Meteor } from "meteor/meteor";
import { ReactiveVar } from "meteor/reactive-var";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";

import { CourseDiscussions } from "/imports/api/course-discussions/course-discussions";
import { TrackerAsync } from "/imports/utils/promisify";

import { routerAutoscroll } from "/imports/ui/lib/router-autoscroll";

import "/imports/ui/components/buttons";
import "/imports/ui/components/richtext";
import "/imports/ui/components/avatar";
import "/imports/ui/components/profile-link";

import "./post";

import "./template.html";
import "./styles.scss";

const Template = TemplateAny as TemplateStaticTyped<
  "discussion",
  { select: string; courseId: string },
  {
    count: ReactiveVar<number>;
    limit: ReactiveVar<number>;
    edit: ReactiveVar<boolean>;
    notifyAll: ReactiveVar<boolean>;
  }
>;

const template = Template.discussion;

template.onCreated(function () {
  const instance = this;

  instance.count = new ReactiveVar(0);

  // If we want to jump to a comment we don't fold the comments
  const { select } = instance.data;
  const limit = select ? 0 : 3;
  instance.limit = new ReactiveVar(limit);

  instance.subscribe("discussion", instance.data.courseId, async () => {
    if (select) {
      // Wait for the templates to render before trying to jump there.
      await TrackerAsync.afterFlush();

      // Jump to the selected comment.
      // This method should work for screenreaders too.
      window.location.hash = `#comment${select}`;
      routerAutoscroll.scheduleScroll();
    }
  });

  instance.edit = new ReactiveVar(false);
  instance.notifyAll = new ReactiveVar(false);
});

template.helpers({
  posts() {
    const instance = Template.instance();
    const { data } = instance;

    let posts = CourseDiscussions.find(
      {
        courseId: data.courseId,
        parentId: { $exists: false },
      },
      {
        sort: { time_updated: -1 },
      },
    ).fetch();

    const count = posts.length;
    instance.count.set(count);

    const limit = instance.limit.get();
    if (limit) {
      posts = posts.slice(0, limit);
    }

    return posts;
  },

  newPostAttr() {
    const instance = Template.instance();
    const { data } = instance;

    return {
      post: {
        new: true,
        courseId: data.courseId,
        userId: Meteor.userId(),
        text: "",
        notifyAll: instance.notifyAll.get(),
      },
      edit: instance.edit.get(),
      onCancel: () => {
        instance.edit.set(false);
        instance.notifyAll.set(false);
      },
    };
  },

  limited() {
    const instance = Template.instance();
    const limit = instance.limit.get();

    if (limit) {
      return instance.count.get() > limit;
    }
    return false;
  },

  count() {
    return Template.instance().count.get();
  },
});

template.events({
  "click .js-show-all-posts"(_event, instance) {
    instance.limit.set(0);
  },
  "notifyAll #discussion"(_event, instance) {
    instance.edit.set(true);
    instance.notifyAll.set(true);
    window.location.hash = "#discussion";
    routerAutoscroll.scheduleScroll();
  },
  "writeComment #discussion"(_event, instance) {
    instance.edit.set(true);
    window.location.hash = "#discussion";
    routerAutoscroll.scheduleScroll();
  },
});
