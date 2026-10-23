import { Log } from "../../log/log";
import { fixtureGroupChatMessages } from "./data";

export async function create() {
  // Ensure all groups exist, otherwise re-create the specific group from fixture data.
  // Ensure all group members exist and have the expected roles, otherwise add them to the group with the specific roles.
  // Then insert the group chat messages
  // Update dates for each message so they were sent in the past few days.

  Log.record("testdata", ["GroupChatMessages"], {
    message: `Inserted ${fixtureGroupChatMessages.length} group chat message fixtures.`,
  });
}
