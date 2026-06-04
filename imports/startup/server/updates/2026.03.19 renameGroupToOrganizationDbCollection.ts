import { MongoInternals } from "meteor/mongo";

export async function update() {
  const rawDb = MongoInternals.defaultRemoteCollectionDriver().mongo.db;

  if ((await rawDb.listCollections({ name: "Organizations" }).toArray()).length > 0) {
    await rawDb
      .collection("Organizations")
      .rename("Organizations_forDeleteAfterDbMigrate_" + Date.now());
  }
  await rawDb.collection("Groups").rename("Organizations");

  return 1;
}
