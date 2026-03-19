import { MongoInternals } from "meteor/mongo";

export async function update() {
  const rawDb = MongoInternals.defaultRemoteCollectionDriver().mongo.db;
  await rawDb.collection("Organizations").rename("Organizations_forDeleteAfterDbMigrate");
  await rawDb.collection("Groups").rename("Organizations");

  return 1;
}
