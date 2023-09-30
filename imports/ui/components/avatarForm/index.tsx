import { Meteor } from "meteor/meteor";
import { i18n } from "/imports/startup/both/i18next";
import { ReactiveVar } from "meteor/reactive-var";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";

import * as usersMethods from "/imports/api/users/methods";
import * as Alert from "/imports/api/alerts/alert";

import "../avatar";

import "./template.html";
import "./styles.scss";

const Template = TemplateAny as TemplateStaticTyped<
  "avatarForm",
  unknown,
  { tempColor: ReactiveVar<number> }
>;

const template = Template.avatarForm;

template.onCreated(function () {
  this.tempColor = new ReactiveVar(Meteor.user()?.avatar?.color || 0);
});

template.onRendered(() => {
  $("#avatarColorRange").val(Template.instance().tempColor.get());
});

template.helpers({
  color() {
    return Template.instance().tempColor.get();
  },
});

template.events({
  "input .js-change-avatar-color"(event, instance) {
    instance.tempColor.set(parseInt((event.target as HTMLInputElement).value, 10));
  },

  async "change .js-change-avatar-color"(_event, instance) {
    const newColor = Number(instance.tempColor.get());

    // only update the color if it has changed
    if (Meteor.user()?.avatar?.color === newColor) {
      return;
    }

    await usersMethods.updateAvatarColor(newColor);

    Alert.success(i18n("profile.updated", "Updated profile"));
  },
});
