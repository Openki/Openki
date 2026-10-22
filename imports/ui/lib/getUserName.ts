import { assignIn } from "lodash-es";
import { i18n } from "/imports/startup/both/i18next";
import { Tracker } from "meteor/tracker";

import { User, UserEntity, Users } from "/imports/api/users/users";
import * as UsersPub from "/imports/api/users/publications";

// We cache the username lookups
// To prevent unlimited cache-growth, after a enough lookups we
// build a new cache from the old
const cacheLimit = 1000;
let cache: Record<string, Pick<UserEntity, "username" | "contribution"> & User> = {};
let previousCache: typeof cache = {};
let lookups = 0;
const pending: Record<string, Tracker.Dependency> = {};

// Update the cache if users are pushed to the collection
Users.find({}, { projection: { _id: 1, username: 1, contribution: 1 } }).observe({
  added(user) {
    cache[user._id] = assignIn(new User(), user || { username: "?!" });
    if (pending[user._id]) {
      pending[user._id].changed();
      // oxlint-disable-next-line no-dynamic-delete
      delete pending[user._id];
    }
  },
  changed(user) {
    cache[user._id] = user;
  },
});

export const getCachedUser = (userId: string) => {
  // Consult cache
  let cachedUser = cache[userId];
  if (cachedUser === undefined) {
    // Consult old cache
    cachedUser = previousCache[userId];

    // Carry to new cache if it was present in the old
    if (cachedUser !== undefined) {
      cache[userId] = cachedUser;
    }
  }

  if (cachedUser === undefined) {
    // Substitute until the name (or its absence) is loaded
    cachedUser = assignIn(new User(), { username: "◌" });

    if (pending[userId]) {
      pending[userId].depend();
    } else {
      // Cache miss, now we'll have to round-trip to the server
      lookups += 1;
      pending[userId] = new Tracker.Dependency();
      pending[userId].depend();

      // Cycle the cache if it's full
      if (cacheLimit < lookups) {
        previousCache = cache;
        cache = {};
        lookups = 0;
      }

      UsersPub.simple.subscribe(userId);
    }
  }

  return cachedUser;
};

export function getUserName(userId: string) {
  if (!userId) {
    return i18n("noUser_placeholder", "someone");
  }

  const cachedUser = getCachedUser(userId);

  if (!cachedUser) {
    return `userId: ${userId}`;
  }

  return cachedUser.getDisplayName();
}
