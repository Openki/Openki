import { assert } from "chai";
import { Meteor } from "meteor/meteor";
import { MeteorAsync } from "/imports/utils/promisify";
import { Session } from "meteor/session";

import { Groups } from "../../../imports/api/groups/groups";
import { UserModel } from "/imports/api/users/users";

import { Default as RegionDefault } from "/imports/ui/lib/cleaned-region";
import { PublicSettings } from "/imports/utils/PublicSettings";

if (Meteor.isClient) {
  describe("Groups", () => {
    describe("Find by filter", () => {
      before(async function () {
        this.timeout(8000);

        // A previous test might have logged us in.
        if (Meteor.userId()) {
          await Meteor.logoutAsync();
        }
        Session.set("region", RegionDefault);
      });

      it("should a gast only show groups from public tenants", async function () {
        this.timeout(6000);

        await MeteorAsync.subscribe("Groups.findFilter");

        const groupsAsGast = Groups.findFilter().fetch();

        assert.isNotEmpty(groupsAsGast, "shows groups");

        assert.isEmpty(
          groupsAsGast.filter((g) => g.tenant && !PublicSettings.publicTenants.includes(g.tenant)),
          "don't show groups from not public",
        );
      });

      it("should allow a logged in user to see groups from their tenant", async function () {
        this.timeout(6000);

        await MeteorAsync.subscribe("Groups.findFilter");

        const groupsAsGast = Groups.findFilter().fetch();

        await Meteor.loginWithPasswordAsync("Schufien", "greg");
        const schufien = (await Meteor.userAsync()) as UserModel;

        assert.ok(schufien);

        const groupsAsSchufien = Groups.findFilter().fetch();

        assert.includeMembers(
          groupsAsSchufien.map((g) => g._id),
          groupsAsGast.map((g) => g._id),
          "shows public groups as logged in user",
        );

        assert.isTrue(
          groupsAsSchufien.length > groupsAsGast.length,
          "shows private groups as logged in user",
        );
        assert.isNotEmpty(
          groupsAsSchufien.filter(
            (g) => g.tenant && schufien.tenants.some((t) => t._id === g.tenant),
          ),
          "shows private groups as logged in user",
        );
      });

      it("should allow to be called with empty params", async function () {
        this.timeout(6000);

        await MeteorAsync.subscribe("Groups.findFilter", {}, undefined, undefined, []);

        Groups.findFilter({}, undefined, undefined, []).fetch();
      });
    });
  });
}
