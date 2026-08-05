import { Meteor } from "meteor/meteor";
import { MeteorAsync } from "/imports/utils/promisify";
import { assert } from "chai";

import { Organizations } from "../../../imports/api/organizations/organizations";
import * as OrganizationsMethods from "../../../imports/api/organizations/methods";

if (Meteor.isClient) {
  describe("Organization save", () => {
    it("should allow to edit the organization name", async function () {
      this.timeout(5000);

      const randomName = `TEST${1000 + Math.floor(Math.random() * 9000)}`;
      const editRandomName = `TEST${1000 + Math.floor(Math.random() * 9000)}`;

      await Meteor.loginWithPasswordAsync("Seee", "greg");

      const newOrganization = {
        name: randomName,
        short: `${randomName} short`,
        claim: `${randomName} claim`,
        description: `${randomName} description`,
      };

      const organizationId = await OrganizationsMethods.save("", newOrganization);

      assert.isString(organizationId, "organization.save returns an organizationId string");

      await OrganizationsMethods.save(organizationId as string, { name: editRandomName });

      const handle = await MeteorAsync.subscribe("organization", organizationId);
      handle.stop();

      const organization = Organizations.findOne(organizationId);

      assert.equal(organization?.name, editRandomName);
    });

    it("does not allow setting a empty organization name", async function () {
      this.timeout(5000);

      const randomName = `TEST${1000 + Math.floor(Math.random() * 9000)}`;

      await Meteor.loginWithPasswordAsync("Seee", "greg");

      const newOrganization = {
        name: randomName,
        short: `${randomName} short`,
        claim: `${randomName} claim`,
        description: `${randomName} description`,
      };

      const organizationId = await OrganizationsMethods.save("", newOrganization);

      assert.isString(organizationId, "organization.save returns an organizationId string");

      let hasFailed = false;
      try {
        await OrganizationsMethods.save(organizationId as string, { name: "" });
      } catch (err) {
        if (err) {
          hasFailed = true;
        }
      }
      assert.isTrue(hasFailed, "organization.save throws an error on empty name");
    });
  });
}
