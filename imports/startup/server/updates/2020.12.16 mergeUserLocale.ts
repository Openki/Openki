import { Users } from "/imports/api/users/users";

/**
 * merge the profile locale into the base locale
 */
export async function update() {
  let updated = 0;

  for (const originalUser of await Users.find({}).fetchAsync()) {
    const user = { ...originalUser } as any;
    if (user.profile) {
      user.locale = user.profile.locale;
      delete user.profile.locale;
    }
    user.locale = user.locale || "en";

    updated += await Users.updateAsync(user._id, user);
  }

  return updated;
}
