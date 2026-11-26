import { Meteor } from "meteor/meteor";
import * as Profile from "../../../utils/profile";

/**
 * Map unsubscription types used by emails to the API endpoint that handles the unsubscription.
 */
const unsubscribePaths = {
  automatedNotifications: "notifications",
  privateMessage: "privatemessages",
} as const satisfies Record<string, NotificationUnsubscribeAPIEndpoint>;

/**
 * This type describes the unsubscription types used by email templates
 * NOTE: Since we don't store the related unsubscription type in the DB,
 * we could further simplify the types and keep the code easier to understand and maintain.
 *
 */
export type NotificationUnsubscribeType = keyof typeof unsubscribePaths;

/** API Endpoint - defined here to get fully type-safe URLs */
export const unsubscribeApiEndpoint = "/profile/:notificationType/unsubscribe/:token" as const;

/**
 * Get the URL where users can unsubscribe by submitting a valid token.
 */
export function getUnsubscribeURL(type: NotificationUnsubscribeType, token: string) {
  const path = unsubscribePaths[type];
  if (!path) {
    throw new Error("Missing unsubscribe path for type", { cause: { type, token } });
  }
  return new URL(
    unsubscribeApiEndpoint
      .replace(":notificationType", path)
      .replace(":token", encodeURIComponent(token)),
    Meteor.absoluteUrl(),
  ).toString();
}

/**
 * Use this URL to redirect users after successfully verifying their unsubscription token.
 */
export function getUnsubscribeRedirectURL(
  type: NotificationUnsubscribeAPIEndpoint,
  accepted: boolean,
) {
  const url = new URL(Meteor.absoluteUrl("profile"));
  url.search = new URLSearchParams([
    accepted ? ["unsubscribed", type] : ["unsubscribe-error", ""],
  ]).toString();

  return url.toString();
}

/**
 * This defines both valid notification API endpoints
 * and their respective unsubscribe handlers.
 */
export const notificationUnsubscribeHandlers = {
  notifications: Profile.Notifications.unsubscribe,
  privatemessages: Profile.PrivateMessages.unsubscribe,
} as const satisfies Record<string, (token: string) => Promise<boolean>>;

/**
 * The valid types of of notifications that can be unsubscribed from.
 */
export type NotificationUnsubscribeAPIEndpoint = keyof typeof notificationUnsubscribeHandlers;

export const notificationTypes = Object.keys(
  notificationUnsubscribeHandlers,
) as NotificationUnsubscribeAPIEndpoint[];
