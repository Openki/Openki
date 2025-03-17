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

  async tenant(name: string, adminId?: string | undefined) {
    const tenant = await Tenants.findOneAsync({ name });
    if (tenant) {
      if (adminId) {
        if (tenant?.admins?.includes(adminId)) {
          return tenant._id;
        }

        await Tenants.updateAsync(tenant._id, {
          $addToSet: { admins: adminId },
        });

        if (tenant?.members?.includes(adminId)) {
          return tenant._id;
        }

        await Tenants.updateAsync(tenant._id, {
          $addToSet: { members: adminId },
        });
      }

      return tenant._id;
    }

    const id = ensure.fixedId([name]);

    await Tenants.insertAsync({
      _id: id,
      name,
      members: adminId ? [adminId] : [],
      admins: adminId ? [adminId] : [],
    });
    /* eslint-disable-next-line no-console */
    console.log(`Added tenant: ${name} ${id}`);

    return id;
  },

  async userInTenant(user: UserEntity, regionId: string) {
    const region = await Regions.findOneAsync(regionId);

    if (!region || !region.tenant) {
      return;
    }

    if (user.tenants?.some((t) => t._id === region.tenant)) {
      return;
    }

    await Users.updateAsync(user._id, {
      $addToSet: { tenants: { _id: region.tenant, privileges: ["admin"] } },
    });

    const tenant = await Tenants.findOneAsync(region.tenant);

    if (!tenant || tenant?.members?.includes(user._id)) {
      return;
    }

    await Tenants.updateAsync(tenant._id, {
      $addToSet: { members: user._id },
    });
  },

  async user(name: string, region?: string | undefined, verified = false) {
    const prng = Prng("ensureUser");

    if (!name) {
      /* eslint-disable-next-line no-param-reassign */
      name = "Ed Dillinger";
    }
    const email = `${name.split(" ").join("")}@openki.example`.toLowerCase();

    let user = await Users.findOneAsync({ "emails.address": email });
    if (user) {
      if (region) {
        await ensure.userInTenant(user, region);
      }
      return user;
    }

    user = await Users.findOneAsync({ username: name });
    if (user) {
      if (region) {
        await ensure.userInTenant(user, region);
      }
      return user;
    }

    const id = await Accounts.createUserAsync({
      username: name,
      email,
      profile: { name },
      notifications: true,
      allowPrivateMessages: true,
    } as any);

    const age = Math.floor(prng() * 100000000000);
    const time = new Date().getTime();
    await Users.updateAsync(
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
      await Users.updateAsync(
        { _id: id },
        {
          $set: { "emails.0.verified": true },
        },
      );
    }

    user = await Users.findOneAsync(id);

    if (!user) {
      throw new Error("Unexpected undefined");
    }

    if (region) {
      await ensure.userInTenant(user, region);
    }
    return user;
  },

  async region(name: string) {
    const region = await Regions.findOneAsync({ name });
    if (region) {
      return region._id;
    }

    const id = await Regions.insertAsync({
      name,
      loc: { type: "Point", coordinates: [8.3, 47.05] },
    } as Mongo.OptionalId<RegionEntity>);
    /* eslint-disable-next-line no-console */
    console.log(`Added region: ${name} ${id}`);

    return id;
  },

  async group(short: string) {
    const group = await Groups.findOneAsync({ short });
    if (group) {
      return group._id;
    }

    const id = ensure.fixedId([short]);
    await Groups.insertAsync({
      _id: id,
      name: short,
      short,
      claim: "",
      members: [{ user: (await ensure.user("Ed Dillinger"))._id, notify: true }],
      description: "Fixture group",
      createdby: (await ensure.user("Ed Dillinger"))._id,
      time_created: new Date(),
      time_lastedit: new Date(),
    });
    /* eslint-disable-next-line no-console */
    console.log(`Added fixture group '${short}' id: ${id}`);

    return id;
  },

  async venue(name: string, regionId: string, id?: string) {
    const prng = Prng("ensureVenue");

    let venue = await Venues.findOneAsync({ name, region: regionId });
    if (venue) {
      return venue;
    }

    const venueEntity = {
      name,
      region: regionId,
    } as VenueEntity;

    venueEntity.slug = StringTools.slug(venueEntity.name);

    const region = await Regions.findOneAsync(regionId);
    if (!region || !region.loc) {
      throw new Error("Unexpected undefined");
    }
    const lat = region.loc.coordinates[1] + prng() ** 2 * 0.02 * (prng() > 0.5 ? 1 : -1);
    const lon = region.loc.coordinates[0] + prng() ** 2 * 0.02 * (prng() > 0.5 ? 1 : -1);
    venueEntity.loc = { type: "Point", coordinates: [lon, lat] };

    venueEntity._id = id || ensure.fixedId([venueEntity.name, venueEntity.region as string]);

    const age = Math.floor(prng() * 80000000000);
    venueEntity.created = new Date(new Date().getTime() - age);
    venueEntity.updated = new Date(new Date().getTime() - age * 0.25);

    await Venues.insertAsync(venueEntity);

    venue = await Venues.findOneAsync({ name, region: regionId });
    if (!venue) {
      throw new Error("Unexpected undefined");
    }
    return venue;
  },
};
