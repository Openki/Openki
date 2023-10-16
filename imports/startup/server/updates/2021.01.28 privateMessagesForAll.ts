import { Users } from "/imports/api/users/users";

/** @typedef {import('/imports/api/users/users').UserModel} UserModel */

export function update() {
  let updated = 0;

  Users.find({})
    .fetch()
    .forEach((orginalUser) => {
      const user = { ...orginalUser } as any;
      user.allowPrivateMessages = true;
      delete user.acceptsMessages;
      updated += Users.update(user._id, user);
    });

  return updated;
}
