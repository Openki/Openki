import { UserModel } from "/imports/api/users/users";
import { Props as RootProps } from "../../../emails/Root";

import * as event from "./notifications/event";
import * as eventCanceled from "./notifications/event.canceled";
import * as eventReminder from "./notifications/event.reminder";
import * as eventContactParticipants from "./notifications/event.contact-participants";
import * as rsvp from "./notifications/rsvp";
import * as rsvpTeam from "./notifications/rsvp.team";
import * as comment from "./notifications/comment";
import * as join from "./notifications/join";
import * as groupCourse from "./notifications/group.course";
import * as privateMessage from "./notifications/private-message";

export type Model<T> = {
  accepted(user: UserModel): void;
  vars(
    locale: string,
    user: UserModel,
    unsubToken: string,
  ): {
    fromAddress?: string | undefined;
  } & RootProps &
    // Remove some props
    Omit<T, "siteName" | "customSiteName" | "username" | "lng">;
  template: (
    props: {
      fromAddress?: string | undefined;
      siteName: string;
      username: string;
      lng: string;
    } & RootProps &
      T,
  ) => React.JSX.Element;
};

export const Notification = {
  Event: event,
  "Event.Canceled": eventCanceled,
  "Event.Reminder": eventReminder,
  "Event.ContactParticipants": eventContactParticipants,
  Rsvp: rsvp,
  "Rsvp.Team": rsvpTeam,
  Comment: comment,
  Join: join,
  "Group.Course": groupCourse,
  PrivateMessage: privateMessage,
};
