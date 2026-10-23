import { type GroupRole } from "../../groups/groups";
import { groups } from "../groups/data";

export const groupChatMessages: {
  groupName: (typeof groups)[number]["name"];
  messages: {
    content: string;
    user: string;
    roleId: GroupRole["id"];
    createdAt: string;
    updatedAt: string;
  }[];
}[] = [
  {
    groupName: "Elektronik",
    messages: [
      {
        content: "Hello team! Looking forward to get to know you.",
        user: "greg",
        roleId: "team",
        createdAt: "2026-10-19T15:49:09.770Z",
        updatedAt: "2026-10-19T15:49:09.770Z",
      },
      {
        content: "We should start planning.",
        user: "greg",
        roleId: "team",
        createdAt: "2026-10-19T15:51:42.090Z",
        updatedAt: "2026-10-19T15:51:42.090Z",
      },
      {
        content: "Indeed, I have some ideas.",
        user: "LeOnI",
        roleId: "team",
        createdAt: "2026-10-19T16:25:44.870Z",
        updatedAt: "2026-10-19T16:25:44.870Z",
      },
      {
        content:
          "What if we start with a demo to catch their interest? And then a hands-on workshop where they can try themselves?",
        user: "LeOnI",
        roleId: "team",
        createdAt: "2026-10-19T16:38:11.070Z",
        updatedAt: "2026-10-19T16:38:11.070Z",
      },
      {
        content:
          "That sounds good!\n\nI wonder what we do about the room? Anyone know a place where we can be?",
        user: "IvanZ",
        roleId: "team",
        createdAt: "2026-10-20T11:53:05.420Z",
        updatedAt: "2026-10-20T11:53:05.420Z",
      },
      {
        content: "Please anyone?",
        user: "IvanZ",
        roleId: "team",
        createdAt: "2026-10-20T11:53:05.420Z",
        updatedAt: "2026-10-20T11:53:05.420Z",
      },
      {
        content: "Next to the station would work well. Though only space for 20 people.",
        user: "greg",
        roleId: "team",
        createdAt: "2026-10-20T11:54:59.955Z",
        updatedAt: "2026-10-20T11:54:59.955Z",
      },
      {
        content:
          "Thanks for the suggestion! 20 should be enough for now. Let's contact the participants.",
        user: "IvanZ",
        roleId: "team",
        createdAt: "2026-10-20T12:49:42.194Z",
        updatedAt: "2026-10-20T12:49:42.194Z",
      },
      {
        content: "Can someone bring a powerbank?",
        user: "IvanZ",
        roleId: "team",
        createdAt: "2026-10-20T16:53:51.347Z",
        updatedAt: "2026-10-20T16:53:51.347Z",
      },
    ],
  },
];
