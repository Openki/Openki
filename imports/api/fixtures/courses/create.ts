/* eslint-disable no-await-in-loop */
import { CourseEntity, Courses } from "/imports/api/courses/courses";
import { ensure } from "/imports/api/fixtures/ensureFixture";
import { Prng } from "/imports/api/fixtures/Prng";
import * as StringTools from "/imports/utils/string-tools";

import { courses as coursesBase } from "./data";
import { courses as coursesZuerichLernt } from "./zuerichlernt";
import { Log } from "../../log/log";

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

  for (const template of coursesBase) {
    let region: string;
    if (template.region) {
      region = await ensure.region(template.region);
    } else {
      /* place in random test region, Spilistan or Testistan */
      region = prng() > 0.85 ? "9JyFCoKWkxnf8LWPh" : "EZqQLGL4PtFCxCNrp";
    }

    const age = Math.floor(prng() * 80000000000);

    const course = {
      _id: ensure.fixedId([template.name, template.description]),
      name: template.name,
      categories: template.categories || [],
      tags: template.tags || [],
      groups: await Promise.all(template.groups?.map((g) => ensure.group(g)) || []),
      groupOrganizers: [],
      description: template.description,
      compactImage: "",
      image: "",
      slug: StringTools.slug(template.name),
      region,
      customFields: [],
      createdby: (await ensure.user(template.createdby, region))._id,
      time_created: new Date(new Date().getTime() - age),
      time_lastedit: new Date(new Date().getTime() - age * 0.25),
      roles: template.roles,
      members: await Promise.all(
        template.members.map(async (member) => ({
          ...member,
          user: (await ensure.user(member.user, region))._id,
        })),
      ),
      internal: template.internal || false,
      singleEvent: template.singleEvent || false,
      archived: template.archived,
      history: [],
    } as unknown as CourseEntity;

    // eslint-disable-next-line no-await-in-loop
    await Courses.insertAsync(course);
  }

  for (const template of coursesZuerichLernt) {
    const age = Math.floor(prng() * 80000000000);

    const course = {
      _id: template._id,
      name: template.name,
      categories: template.categories || [],
      groups: template.groups,
      groupOrganizers: [],
      description: template.description,
      compactImage: template.image,
      image: template.image,
      slug: StringTools.slug(template.name),
      region: template.region,
      customFields: template.customFields,
      createdby: (await ensure.user(template.createdby, template.region))._id,
      time_created: new Date(new Date().getTime() - age),
      time_lastedit: new Date(new Date().getTime() - age * 0.25),
      roles: template.roles,
      members: await mapSync(template.members, async (member) => ({
        ...member,
        user: (await ensure.user(member.user, template.region))._id,
      })),
      internal: template.internal || false,
      singleEvent: template.singleEvent || false,
      archived: template.archived,
      history: template.history
        ? await mapSync(template.history, async (h) => {
            // eslint-disable-next-line no-param-reassign
            h.dateTime = new Date(h.dateTime.$date) as any;
            if (h.data.createdby)
              // eslint-disable-next-line no-param-reassign
              h.data.createdby = (await ensure.user(h.data.createdby, template.region))._id;
            if (h.data.updatedBy)
              // eslint-disable-next-line no-param-reassign
              h.data.updatedBy = (await ensure.user(h.data.updatedBy, template.region))._id;
            if (h.data.user)
              // eslint-disable-next-line no-param-reassign
              h.data.user = (await ensure.user(h.data.user, template.region))._id;
            return h;
          })
        : [],
    } as unknown as CourseEntity;

    // eslint-disable-next-line no-await-in-loop
    await Courses.insertAsync(course);
  }

  Log.record("testdata", ["Courses"], {
    message: `Inserted ${coursesBase.length + coursesZuerichLernt.length} course fixtures.`,
  });
}
