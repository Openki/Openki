/* eslint-disable no-await-in-loop */
import { Mongo } from "meteor/mongo";
import { GroupEntity, GroupMemberEntity, Groups } from "../../groups/groups";
import { ensure } from "../ensureFixture";
import { groups } from "./data";

export async function create() {
  for (const g of groups) {
    const group = { ...g } as unknown as Mongo.OptionalId<GroupEntity>;
    group.createdby = "ServerScript_loadingTestgroups";

    // Always use same id for same group to avoid broken urls while testing
    group._id = ensure.fixedId([group.name, group.description]);
    group.members = await Promise.all(
      g.members?.map(
        async (name) =>
          ({
            user: (await ensure.user(name, undefined))._id,
            notify: true,
          }) as GroupMemberEntity,
      ) || [],
    );
    await Groups.insertAsync(group);
  }

  return `Inserted ${groups.length} group fixtures.`;
}
