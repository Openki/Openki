import { Users } from "/imports/api/users/users";

export async function update() {
  let updated = 0;

  for (const orginalUser of await Users.find({}).fetchAsync()) {
    const user = { ...orginalUser } as any;
    user.allowPrivateMessages = true;
    delete user.acceptsMessages;
    // eslint-disable-next-line no-await-in-loop
    updated += await Users.updateAsync(user._id, user);
  }

  return updated;
}
