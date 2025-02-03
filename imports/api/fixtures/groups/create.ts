/* eslint-disable no-await-in-loop */
import { Mongo } from "meteor/mongo";
import { GroupEntity, GroupMemberEntity, Groups } from "../../groups/groups";
import { ensure } from "../ensureFixture";
import { groups as baseGroups } from "./data";
import { data as zuerichlerntGroups } from "./zuerichlernt";
import { Log } from "../../log/log";

export async function create() {
  const groups = [...baseGroups, ...zuerichlerntGroups];
  for (const template of groups) {
    const group = {
      _id: template._id || ensure.fixedId([template.name, template.description]),
      name: template.name,
      short: template.short,
      claim: template.claim,
      description: template.description,
      logoUrl: template.logoUrl,
      customCourseFields: template.customCourseFields,
      dashboard: template.dashboard,
      members: await Promise.all(
        template.members?.map(
          async (name) =>
            ({
              user: (await ensure.user(name, undefined))._id,
              notify: true,
            }) as GroupMemberEntity,
        ) || [],
      ),
      createdby: template.createdby
        ? (await ensure.user(template.createdby))._id
        : "ServerScript_loadingTestgroups",
    } as Mongo.OptionalId<GroupEntity>;

    await Groups.insertAsync(group);
  }

  Log.record("testdata", ["Groups"], { message: `Inserted ${groups.length} group fixtures.` });
}
