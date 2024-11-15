import { Mongo } from "meteor/mongo";
import { GroupEntity, Groups } from "../../groups/groups";
import { ensure } from "../ensureFixture";
import { groups } from "./data";

export function groupsCreate() {
  groups.forEach((g) => {
    const group = { ...g } as unknown as Mongo.OptionalId<GroupEntity>;
    group.createdby = "ServerScript_loadingTestgroups";

    // Always use same id for same group to avoid broken urls while testing
    group._id = ensure.fixedId([group.name, group.description]);
    group.members =
      g.members?.map((name) => ({ user: ensure.user(name, undefined)._id, notify: true })) || [];
    Groups.insert(group);
  });

  return `Inserted ${groups.length} group fixtures.`;
}
