import { Accounts } from "meteor/accounts-base";
import crypto from "crypto";
import { Mongo } from "meteor/mongo";

import { Prng } from "/imports/api/fixtures/Prng";
import { Groups } from "/imports/api/groups/groups";
import { Tenants } from "/imports/api/tenants/tenants";
import { RegionEntity, Regions } from "/imports/api/regions/regions";
import { VenueEntity, Venues } from "/imports/api/venues/venues";
import { UserEntity, Users } from "/imports/api/users/users";

import * as StringTools from "/imports/utils/string-tools";

export const ensure = {
  fixedId(strings: string[]) {
    const md5 = crypto.createHash("md5");
    strings.forEach((str) => md5.update(str));
    return md5.digest("hex").substring(0, 10);
  },

  tenant(name: string, adminId?: string | undefined) {
    const tenant = Tenants.findOne({ name });
    if (tenant) {
      if (adminId) {
        if (tenant?.admins?.includes(adminId)) {
          return tenant._id;
        }

        Tenants.update(tenant._id, {
          $addToSet: { admins: adminId },
        });

        if (tenant?.members?.includes(adminId)) {
          return tenant._id;
        }

        Tenants.update(tenant._id, {
          $addToSet: { members: adminId },
        });
      }

      return tenant._id;
    }

    const id = ensure.fixedId([name]);

    Tenants.insert({
      _id: id,
      name,
      members: adminId ? [adminId] : [],
      admins: adminId ? [adminId] : [],
    });
    /* eslint-disable-next-line no-console */
    console.log(`Added tenant: ${name} ${id}`);

    return id;
  },

  userInTenant(user: UserEntity, regionId: string) {
    const region = Regions.findOne(regionId);

    if (!region || !region.tenant) {
      return;
    }

    if (user.tenants?.some((t) => t._id === region.tenant)) {
      return;
    }

    Users.update(user._id, {
      $addToSet: { tenants: { _id: region.tenant, privileges: ["admin"] } },
    });

    const tenant = Tenants.findOne(region.tenant);

    if (!tenant || tenant?.members?.includes(user._id)) {
      return;
    }

    Tenants.update(tenant._id, {
      $addToSet: { members: user._id },
    });
  },

  user(name: string, region?: string | undefined, verified = false) {
    const prng = Prng("ensureUser");

    if (!name) {
      /* eslint-disable-next-line no-param-reassign */
      name = "Ed Dillinger";
    }
    const email = `${name.split(" ").join("")}@openki.example`.toLowerCase();

    let user = Users.findOne({ "emails.address": email });
    if (user) {
      if (region) {
        ensure.userInTenant(user, region);
      }
      return user;
    }

    user = Users.findOne({ username: name });
    if (user) {
      if (region) {
        ensure.userInTenant(user, region);
      }
      return user;
    }

    const id = Accounts.createUser({
      username: name,
      email,
      profile: { name },
      notifications: true,
      allowPrivateMessages: true,
    } as any);

    const age = Math.floor(prng() * 100000000000);
    const time = new Date().getTime();
    Users.update(
      { _id: id },
      {
        $set: {
          // Every password is set to "greg".
          // Hashing a password with bcrypt is expensive so we use the
          // computed hash.
          services: {
            password: { bcrypt: "$2a$10$pMiVQDN4hfJNUk6ToyFXQugg2vJnsMTd0c.E0hrRoqYqnq70mi4Jq" },
          },
          createdAt: new Date(time - age),
          lastLogin: new Date(time - age / 30),
        } as any,
      },
    );

    if (verified) {
      Users.update(
        { _id: id },
        {
          $set: { "emails.0.verified": true },
        },
      );
    }

    user = Users.findOne(id);

    if (!user) {
      throw new Error("Unexpected undefined");
    }

    if (region) {
      ensure.userInTenant(user, region);
    }
    return user;
  },

  region(name: string) {
    const region = Regions.findOne({ name });
    if (region) {
      return region._id;
    }

    const id = Regions.insert({
      name,
      loc: { type: "Point", coordinates: [8.3, 47.05] },
    } as Mongo.OptionalId<RegionEntity>);
    /* eslint-disable-next-line no-console */
    console.log(`Added region: ${name} ${id}`);

    return id;
  },

  group(short: string) {
    const group = Groups.findOne({ short });
    if (group) {
      return group._id;
    }

    const id = ensure.fixedId([short]);
    Groups.insert({
      _id: id,
      name: short,
      short,
      claim: "",
      members: [{ user: ensure.user("EdDillinger")._id, notify: true }],
      description: "Fixture group",
      createdby: ensure.user("EdDillinger")._id,
      time_created: new Date(),
      time_lastedit: new Date(),
    });
    /* eslint-disable-next-line no-console */
    console.log(`Added fixture group '${short}' id: ${id}`);

    return id;
  },

  venue(name: string, regionId: string) {
    const prng = Prng("ensureVenue");

    let venue = Venues.findOne({ name, region: regionId });
    if (venue) {
      return venue;
    }

    const venueEntity = {
      name,
      region: regionId,
    } as VenueEntity;

    venueEntity.slug = StringTools.slug(venueEntity.name);

    const region = Regions.findOne(regionId);
    if (!region || !region.loc) {
      throw new Error("Unexpected undefined");
    }
    const lat = region.loc.coordinates[1] + prng() ** 2 * 0.02 * (prng() > 0.5 ? 1 : -1);
    const lon = region.loc.coordinates[0] + prng() ** 2 * 0.02 * (prng() > 0.5 ? 1 : -1);
    venueEntity.loc = { type: "Point", coordinates: [lon, lat] };

    venueEntity._id = ensure.fixedId([venueEntity.name, venueEntity.region as string]);

    const age = Math.floor(prng() * 80000000000);
    venueEntity.created = new Date(new Date().getTime() - age);
    venueEntity.updated = new Date(new Date().getTime() - age * 0.25);

    Venues.insert(venueEntity);

    venue = Venues.findOne({ name, region: regionId });
    if (!venue) {
      throw new Error("Unexpected undefined");
    }
    return venue;
  },
};
