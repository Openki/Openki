import { Mongo } from "meteor/mongo";
import {
  OrganizationEntity,
  OrganizationMember,
  Organizations,
} from "../../organizations/organizations";
import { ensure } from "../ensureFixture";
import { organizations as baseOrganizations } from "./data";
import { organizations as zuerichlerntOrganizations } from "./zuerichlernt";
import { Log } from "../../log/log";

export async function create() {
  const organizations = [...baseOrganizations, ...zuerichlerntOrganizations];
  for (const template of organizations) {
    const organization = {
      _id: template._id || ensure.fixedId([template.name, template.description]),
      name: template.name,
      short: template.short,
      claim: template.claim,
      description: template.description,
      logoUrl: template.logoUrl,
      customGroupFields: template.customGroupFields,
      dashboard: template.dashboard,
      members: await Promise.all(
        template.members?.map(
          async (name) =>
            ({
              user: (await ensure.user(name, undefined))._id,
              notify: true,
            }) as OrganizationMember,
        ) || [],
      ),
      createdby: template.createdby
        ? (await ensure.user(template.createdby))._id
        : "ServerScript_loadingTestOrganizations",
    } as Mongo.OptionalId<OrganizationEntity>;

    await Organizations.insertAsync(organization);
  }

  Log.record("testdata", ["Organizations"], {
    message: `Inserted ${organizations.length} organization fixtures.`,
  });
}
