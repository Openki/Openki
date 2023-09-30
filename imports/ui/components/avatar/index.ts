import { Meteor } from "meteor/meteor";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";

import { Users } from "/imports/api/users/users";

import "./template.html";
import "./styles.scss";

const Template = TemplateAny as TemplateStaticTyped<
  "avatar",
  { color?: number; userId?: string; class?: string }
>;

const template = Template.avatar;

template.onCreated(function () {
  const data = this.data;

  if (data.color !== undefined) {
    return;
  }

  if (data.userId !== undefined) {
    this.subscribe("user", data.userId);
  }
});

template.helpers({
  color() {
    const data = Template.instance().data;

    // the form sets the color directly
    if (data.color !== undefined) {
      return data.color;
    }

    // otherwise get the color from a user
    const user = Users.findOne(data.userId || Meteor.userId() || undefined);
    const color = user?.avatar?.color;

    if (color === undefined) {
      return 0;
    }

    return color;
  },

  class() {
    return Template.instance().data.class || "";
  },
});
