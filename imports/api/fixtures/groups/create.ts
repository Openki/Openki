import { GroupEntity, Groups } from "../../groups/groups";
import { ensure } from "/imports/api/fixtures/ensureFixture";
import { Prng } from "/imports/api/fixtures/Prng";
import * as StringTools from "/imports/utils/string-tools";

import { groups as groupsBase } from "./data";
import { groups as groupsZuerichLernt } from "./zuerichlernt";
import { Log } from "../../log/log";
import { PRNG } from "seedrandom";
import { predefinedRole } from "/imports/api/groups/lib/Role";

async function mapSync<T, U>(
  array: T[],
  callbackfn: (value: T, index: number, array: T[]) => Promise<U>,
): Promise<U[]> {
  const result = [];
  let i = 0;
  for (const item of array) {
    result.push(await callbackfn(item, i, array));
    i += 1;
  }

  return result;
}

export async function create() {
  const prng = Prng("createCourses");

  await Promise.all([createBase(prng), createZuerichLernt(prng)]);

  Log.record("testdata", ["Groups"], {
    message: `Inserted ${groupsBase.length + groupsZuerichLernt.length} group fixtures.`,
  });
}

async function createBase(prng: PRNG) {
  for (const template of groupsBase) {
    let region: string;
    if (template.region) {
      region = await ensure.region(template.region);
    } else {
      /* place in random test region, Spilistan or Testistan */
      region = prng() > 0.85 ? "9JyFCoKWkxnf8LWPh" : "EZqQLGL4PtFCxCNrp";
    }

    const age = Math.floor(prng() * 80000000000);

    const group = {
      _id: ensure.fixedId([template.name, template.description]),
      name: template.name,
      categories: template.categories || [],
      tags: template.tags || [],
      organizations: await Promise.all(
        template.organizations?.map((o) => ensure.organization(o)) || [],
      ),
      teamOrganizations: await Promise.all(
        template.teamOrganizations?.map((o) => ensure.organization(o)) || [],
      ),
      description: template.description,
      compactImage: "",
      image: "",
      slug: StringTools.slug(template.name),
      region,
      customFields: [],
      createdby: (await ensure.user(template.createdby, region))._id,
      time_created: new Date(Date.now() - age),
      time_lastedit: new Date(Date.now() - age * 0.25),
      roles: template.roles.map((role) => predefinedRole(role)),
      members: await Promise.all(
        template.members.map(async (member) => ({
          ...member,
          roles: member.roles.map((role) => ({ id: role, type: "predefined" })),
          user: (await ensure.user(member.user, region))._id,
        })),
      ),
      internal: template.internal || false,
      singleEvent: template.singleEvent || false,
      archived: template.archived,
      history: [],
    } as unknown as GroupEntity;

    await Groups.insertAsync(group);
  }
}

async function createZuerichLernt(prng: PRNG) {
  for (const template of groupsZuerichLernt) {
    const age = Math.floor(prng() * 80000000000);

    const group = {
      _id: template._id || ensure.fixedId([template.name, template.description || ""]),
      name: template.name,
      categories: template.categories || [],
      organizations: template.organizations,
      teamOrganizations: template.organizations,
      description: template.description,
      compactImage: template.image,
      image: template.image,
      slug: StringTools.slug(template.name),
      region: template.region,
      customFields: template.customFields,
      createdby: (await ensure.user(template.createdby, template.region))._id,
      time_created: new Date(Date.now() - age),
      time_lastedit: new Date(Date.now() - age * 0.25),
      roles: template.roles.map((r) => predefinedRole(r)),
      members: await mapSync(template.members, async (member) => ({
        ...member,
        roles: member.roles.map((r) => ({ id: r, type: "predefined" })),
        user: (await ensure.user(member.user, template.region))._id,
      })),
      internal: template.internal || false,
      singleEvent: template.singleEvent || false,
      archived: template.archived,
      history: template.history
        ? await mapSync(template.history, async (h) => {
            h.dateTime = new Date(h.dateTime.$date) as any;
            if (h.data.createdby)
              h.data.createdby = (await ensure.user(h.data.createdby, template.region))._id;
            if (h.data.updatedBy)
              h.data.updatedBy = (await ensure.user(h.data.updatedBy, template.region))._id;
            if (h.data.user) h.data.user = (await ensure.user(h.data.user, template.region))._id;
            return h;
          })
        : [],
    } as unknown as GroupEntity;

    await Groups.insertAsync(group);
  }
}
