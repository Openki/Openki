import { MongoInternals } from "meteor/mongo";

export async function update() {
  const rawDb = MongoInternals.defaultRemoteCollectionDriver().mongo.db;

  if ((await rawDb.listCollections({ name: "Groups" }).toArray()).length > 0) {
    await rawDb.collection("Groups").rename("Groups_forDeleteAfterDbMigrate");
  }
  await rawDb.collection("Courses").rename("Groups");

  if ((await rawDb.listCollections({ name: "GroupDiscussions" }).toArray()).length > 0) {
    await rawDb.collection("GroupDiscussions").rename("GroupDiscussions_forDeleteAfterDbMigrate");
  }
  await rawDb.collection("CourseDiscussions").rename("GroupDiscussions");

  return 1;
}
