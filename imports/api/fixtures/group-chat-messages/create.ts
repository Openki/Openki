import { GroupChatMessages } from "../../group-chat-messages/group-chat-messages";
import { Groups } from "../../groups/groups";
import { getRoleType } from "../../groups/lib/Role";
import { Log } from "../../log/log";
import { type UserModel } from "../../users/users";
import { ensure } from "../ensureFixture";
import { fixtureGroupChatMessages, type FixtureGroupWithChatMessages } from "./data";
import { sum } from "/imports/utils/sum";

function getMessagesWithUpdatedDates({
  messages,
  offsetDays,
}: {
  messages: FixtureGroupWithChatMessages["messages"];
  offsetDays: number;
}) {
  const sorted = messages
    // Revive timestamps into dates.
    .map((m) => ({
      ...m,
      createdAt: new Date(m.createdAt),
      // Assume message was unchanged unless an explicit updatedAt was provided.
      updatedAt: new Date(m.updatedAt ?? m.createdAt),
    }))
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

function getRoles(roleIds: string[]) {
  return roleIds.map((id) => ({ id, type: getRoleType(id) }));
}

const usernamesToUserIds = new Map<UserModel["username"], UserModel["_id"]>();

/**
 * Ensure that a user exists and return their userId.
 *
 * Caches results since many messages will be sent by the same users.
 */
async function getUserId(username: string) {
  // The implementation could be simplified by using `Map.getOrInsertComputed()`
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/getOrInsertComputed
  const existingId = usernamesToUserIds.get(username);
  if (existingId) {
    return existingId;
  }

  const userId = (await ensure.user(username))._id;
  usernamesToUserIds.set(username, userId);
  return userId;
}

export async function create() {
  await Promise.all(
    fixtureGroupChatMessages.map(async (fixture) => {
      const group = await Groups.findOneAsync({
        name: fixture.groupName,
        // createdby: fixture.groupCreatedBy,
      });
      if (!group) {
        throw new Error(
          `Expected group with name "${fixture.groupName}" to exist. It may have been renamed or deleted.

Please re-create the testdata for groups or reset the DB.`,
        );
      }

      await Promise.all(
        fixture.requiredMembers.map(async ({ user: username, roles }) => {
          // First make sure the user with a specific username exists
          const userId = await getUserId(username);
          const member = group.members.find((m) => m.user === userId);

          if (member) {
            // If the user is a group member, add any missing roles
            const missingRoles = roles.filter(
              (roleId) => !member.roles.some(({ id }) => id === roleId),
            );

            if (missingRoles.length) {
              await Groups.updateAsync(
                { _id: group._id, "members.user": userId },
                {
                  $addToSet: { "members.$.roles": getRoles(missingRoles) },
                },
              );
            } else {
              // Else if the user is not yet a group member, add them and all their expected roles.
              await Groups.updateAsync(
                { _id: group._id },
                {
                  $addToSet: {
                    members: {
                      user: userId,
                      roles: getRoles(roles),
                    },
                  },
                },
              );
            }

            // Add the missing roles
            // await Promise.all(
            //   // TODO: get all missing roles and add them all at once
            //   roles.map(async (roleId) => {
            //     if (!member.roles.some(({ id }) => id === roleId)) {
            //       // Now that we're sure she's listed, add the role too
            //       await Groups.updateAsync(
            //         { _id: group._id, "members.user": user._id },
            //         // IDEA: Can we add multiple items at the same time with $addToSet?
            //         {
            //           $addToSet: { "members.$.roles": [{ id: roleId, type: getRoleType(roleId) }] },
            //         },
            //       );
            //     }
            //   }),
            // );
          }
        }),
      );

      // TODO: Maybe not worth it, because we will likely want to support having messages sent by users who are no longer part of a group chat.
      // for (const message of fixture.messages) {
      //   if (!usernameToUserIds.get(message.user)) {
      //     throw new Error(
      //       `GroupChatMessages fixtures has a message which includes user ${message.user}, but they are not part of the group's requiredMembers`,
      //       { cause: { message, requiredMembers: fixture.requiredMembers } },
      //     );
      //   }
      // }

      // IDEA: Pass in requiredMembers not from the fixture, but based on the actual messages instead
      // This would be more robust and reduce duplication in the fixture data.
      // determine required roles by first determining which members are participating
      // TODO: This won't work if someone should have access to a custom role chat while themselves being part of the team.
      // Because writing in the `customRoleId` chat doesn't mean you have that role, you could also be in the `team`.
      // Thus we need the requiredRoles to be explicitly defined.
      // However, we could compare against actual usage and throw an error if the fixtures are invalid.
      // const { group, groupMembers } = await ensure.groupExistsAndHasMembersWithRoles(fixture);

      await Promise.all(
        getMessagesWithUpdatedDates({ messages: fixture.messages, offsetDays: 5 }).map(
          async ({ content, createdAt, updatedAt, user, roleId }) => {
            const userId = await getUserId(user);

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
    message: `Inserted ${sum(fixtureGroupChatMessages.map((fixture) => fixture.messages.length))} group chat message fixtures.`,
  });
}
