import { type GroupRole } from "../../groups/groups";
import { type groups } from "../groups/data";

export interface FixtureGroupWithChatMessages {
  /** Used to find the right group */
  groupName: (typeof groups)[number]["name"];
  /**
   * These members need to be in the group and have the specific roles.
   *
   * The actual messages may be sent by other users who are no longer in the group,
   * or have different roles than at the time when the messages were sent.
   * That's why we need to define the currently required group members explicitly here.
   */
  requiredMembers: { user: string; roles: GroupRole["id"][] }[];
  /**
   * The chat messages to add to the group.
   *
   * This may include older messages by users who are no longer part of the group
   * and/or no longer have the roles required to access their messages.
   */
  messages: {
    content: string;
    user: string;
    roleId: GroupRole["id"];
    createdAt: string;
    updatedAt?: string;
  }[];
}

export const fixtureGroupChatMessages = [
  {
    groupName: "Elektronik",
    requiredMembers: [
      { user: "greg", roles: ["host", "team"] },
      { user: "LeOnI", roles: ["participant", "team"] },
      { user: "IvanZ", roles: ["participant", "team"] },
    ],
    messages: [
      {
        content: "Hello team! Looking forward to get to know you.",
        user: "greg",
        roleId: "team",
        createdAt: "2026-10-19T15:49:09.770Z",
      },
      {
        content: "We should start planning.",
        user: "greg",
        roleId: "team",
        createdAt: "2026-10-19T15:51:42.090Z",
      },
      // This user is a group member, but no longer part of the team.
      {
        content: "Nice chat you got here! 🌚",
        user: "Barbie92",
        roleId: "team",
        createdAt: "2026-10-19T16:20:42.090Z",
      },
      // This user is no longer part of the group, and thus not part of the team.
      {
        content: "I have to agree with Barbie!",
        user: "August",
        roleId: "team",
        createdAt: "2026-10-20T16:53:51.347Z",
      },
      {
        content: "Wait what how did you two get in here? Removing unauthorized users...",
        user: "greg",
        roleId: "team",
        createdAt: "2026-10-19T16:21:00.000Z",
      },
      {
        content: "Lol. Let's start planning - I have some ideas.",
        user: "LeOnI",
        roleId: "team",
        createdAt: "2026-10-19T16:25:44.870Z",
      },
      {
        content:
          "What if we start with a demo to catch their interest? And then a hands-on workshop where they can try themselves?",
        user: "LeOnI",
        roleId: "team",
        createdAt: "2026-10-19T16:38:11.070Z",
      },
      {
        content:
          "That sounds good!\n\nI wonder what we do about the room? Anyone know a place where we can be?",
        user: "IvanZ",
        roleId: "team",
        createdAt: "2026-10-20T11:53:05.420Z",
      },
      {
        content: "Please anyone?",
        user: "IvanZ",
        roleId: "team",
        createdAt: "2026-10-20T11:53:05.420Z",
      },
      {
        content: "Next to the station would work well. Though only space for 20 people.",
        user: "greg",
        roleId: "team",
        createdAt: "2026-10-20T11:54:59.955Z",
      },
      {
        content:
          "Thanks for the suggestion! 20 should be enough for now. Let's contact the participants.",
        user: "IvanZ",
        roleId: "team",
        createdAt: "2026-10-20T12:49:42.194Z",
      },
      {
        content: "Can someone bring a powerbank?",
        user: "IvanZ",
        roleId: "team",
        createdAt: "2026-10-20T16:53:51.347Z",
      },
    ],
  },
] as const satisfies FixtureGroupWithChatMessages[];
