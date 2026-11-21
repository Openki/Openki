import { Meteor } from "meteor/meteor";
import { WebApp } from "meteor/webapp";
import { check } from "meteor/check";

import * as Profile from "/imports/utils/profile";
import { StringEnum } from "/imports/utils/CustomChecks";

// Server only routes

function getProfileNotificationsUnsubscribeURL(type: NotificationType, accepted: boolean) {
  const url = new URL(Meteor.absoluteUrl("profile"));
  url.search = new URLSearchParams([
    accepted ? ["unsubscribed", type] : ["unsubscribe-error", ""],
  ]).toString();

  return url.toString();
}

/**
 * This defines both valid notification types (keys)
 * and their respective unsubscribe handlers.
 */
const notificationUnsubscribeHandlers = {
  notifications: Profile.Notifications.unsubscribe,
  privatemessages: Profile.PrivateMessages.unsubscribe,
};

export type NotificationType = keyof typeof notificationUnsubscribeHandlers;

/** Valid types of notifications that can be unsubscribed from */
const notificationTypes = Object.keys(notificationUnsubscribeHandlers) as NotificationType[];

WebApp.handlers.get("/profile/:notificationType/unsubscribe/:token", async (req, res) => {
  const { token, notificationType } = req.params;
  check(notificationType, StringEnum(...notificationTypes));

  const unsubscribeHandler = notificationUnsubscribeHandlers[notificationType];
  if (!unsubscribeHandler) {
    throw new Meteor.Error(400, `Unsupported notification type: ${notificationType}`);
  }

  const accepted = await unsubscribeHandler(token);

  res.redirect(302, getProfileNotificationsUnsubscribeURL(notificationType, accepted));
});

if (Meteor.isDevelopment) {
  await import("./dev-routes");
}
