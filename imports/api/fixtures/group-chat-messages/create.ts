import { GroupChatMessages } from "../../group-chat-messages/group-chat-messages";
import { Log } from "../../log/log";
import { ensure } from "../ensureFixture";
import { fixtureGroupChatMessages, type FixtureGroupWithChatMessages } from "./data";

function getMessagesWithUpdatedDates({
  messages,
  offsetDays,
}: {
  messages: FixtureGroupWithChatMessages["messages"];
  offsetDays: number;
}) {
  const sorted = messages
    // Revive timestamps into dates
    .map((m) => ({ ...m, createdAt: new Date(m.createdAt), updatedAt: new Date(m.updatedAt) }))
    // Ensure messages are sorted by creation time
    .toSorted((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  /**
   * By comparing with the last message, we can preserve the relative times between messages
   */
  const lastMessageCreatedAt = sorted.at(-1)?.createdAt.getTime();
  if (!lastMessageCreatedAt) {
    throw new Error("Expected to find at least one message");
  }
  const now = Date.now();

  return sorted.map((m) => {
    const delta = lastMessageCreatedAt - m.createdAt.getTime();
    // Update the date so the messages appear to be creted recently,
    // but still preserving the delta relative to the last message.
    // Calculate offsetDays as hours rather than calendar days to get correct offsets.
    m.createdAt = new Date(now - offsetDays * 24 * 60 * 60 * 1000 - delta);
    // Setting correct updatedAt would be easier by generating testdata instead.
    m.updatedAt = m.createdAt;
    return m;
  });
}

export async function create() {
  await Promise.all(
    fixtureGroupChatMessages.map(async (fixture) => {
      // IDEA: Pass in requiredMembers not from the fixture, but based on the actual messages instead
      // This would be more robust and reduce duplication in the fixture data.
      // determine required roles by first determining which members are participating
      // TODO: This won't work if someone should have access to a custom role chat while themselves being part of the team.
      // Because writing in the `customRoleId` chat doesn't mean you have that role, you could also be in the `team`.
      // Thus we need the requiredRoles to be explicitly defined.
      // However, we could compare against actual usage and throw an error if the fixtures are invalid.
      const { group, groupMembers } = await ensure.groupExistsAndHasMembersWithRoles(fixture);

      await Promise.all(
        getMessagesWithUpdatedDates({ messages: fixture.messages, offsetDays: 5 }).map(
          async ({ content, createdAt, updatedAt, user, roleId }) => {
            const userId = groupMembers.find((member) => member.username === user)?._id;
            if (!userId) {
              throw new Error("Expected user to be a group member", {
                cause: { groupMembers, user },
              });
            }

            await GroupChatMessages.insertAsync({
              content,
              groupId: group._id,
              roleId,
              userId,
              createdAt,
              updatedAt,
            });
          },
        ),
      );
    }),
  );

  Log.record("testdata", ["GroupChatMessages"], {
    message: `Inserted ${fixtureGroupChatMessages.length} group chat message fixtures.`,
  });
}
