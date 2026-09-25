import { type JSX } from "react";

import { type UserModel } from "/imports/api/users/users";
import { type Props as RootProps } from "/imports/emails/Root";

import * as event from "./notifications/event";
import * as eventCanceled from "./notifications/event.canceled";
import * as eventReminder from "./notifications/event.reminder";
import * as eventContactParticipants from "./notifications/event.contact-participants";
import * as rsvp from "./notifications/rsvp";
import * as rsvpTeam from "./notifications/rsvp.team";
import * as comment from "./notifications/comment";
import * as join from "./notifications/join";
import * as group from "./notifications/group";
import * as organizationGroup from "./notifications/organization.group";
import * as privateMessage from "./notifications/private-message";

export interface Model<T> {
  accepted(user: UserModel): void;
  vars(
    locale: string,
    user: UserModel,
    unsubToken: string,
  ): Promise<
    {
      fromAddress?: string | undefined;
      customEmailLogo?: string | undefined;
    } & Omit<RootProps, "logo"> &
      // Remove some props
      Omit<T, "siteName" | "customSiteName" | "username" | "lng" | "icalEvent">
  >;
  template: (
    props: {
      fromAddress?: string | undefined;
      siteName: string;
      username: string;
      lng: string;
    } & Omit<RootProps, "logo"> &
      T,
  ) => JSX.Element;
}

export const Notification = {
  [event.ModelName]: event,
  [eventCanceled.ModelName]: eventCanceled,
  [eventReminder.ModelName]: eventReminder,
  [eventContactParticipants.ModelName]: eventContactParticipants,
  [rsvp.ModelName]: rsvp,
  [rsvpTeam.ModelName]: rsvpTeam,
  [comment.ModelName]: comment,
  [join.ModelName]: join,
  [group.ModelName]: group,
  [organizationGroup.ModelName]: organizationGroup,
  [privateMessage.ModelName]: privateMessage,
};
