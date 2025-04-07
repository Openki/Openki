import { onDbMigrate } from "/imports/api/users/venuesDenormalizer";

export async function update() {
  return onDbMigrate();
}
