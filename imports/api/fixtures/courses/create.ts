import { CourseEntity, Courses } from "/imports/api/courses/courses";
import { ensure } from "/imports/api/fixtures/ensureFixture";
import { Prng } from "/imports/api/fixtures/Prng";
import * as StringTools from "/imports/utils/string-tools";

import { courses } from "./data";

export async function create() {
  const prng = Prng("createCourses");

  for (const template of courses) {
    let region: string;
    if (template.region) {
      region = ensure.region(template.region);
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
      groups: template.groups?.map(ensure.group) || [],
      groupOrganizers: [],
      description: template.description,
      compactImage: "",
      image: "",
      slug: StringTools.slug(template.name),
      region,
      customFields: [],
      createdby: ensure.user(template.createdby, region)._id,
      time_created: new Date(new Date().getTime() - age),
      time_lastedit: new Date(new Date().getTime() - age * 0.25),
      roles: template.roles,
      members: template.members.map((member) => ({
        ...member,
        user: ensure.user(member.user, region)._id,
      })),
      internal: template.internal || false,
      singleEvent: template.singleEvent || false,
      archived: template.archived,
      history: [],
    } as unknown as CourseEntity;

    // eslint-disable-next-line no-await-in-loop
    await Courses.insertAsync(course);
  }

  return `Inserted ${courses.length} course fixtures.`;
}
