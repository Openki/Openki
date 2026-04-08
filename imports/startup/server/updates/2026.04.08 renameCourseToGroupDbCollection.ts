import { MongoInternals } from "meteor/mongo";

export async function update() {
  const rawDb = MongoInternals.defaultRemoteCollectionDriver().mongo.db;

  await rawDb.collection("Groups").rename("Groups_forDeleteAfterDbMigrate");
  await rawDb.collection("Course").rename("Groups");

  await rawDb.collection("GroupDiscussions").rename("GroupDiscussions_forDeleteAfterDbMigrate");
  await rawDb.collection("CourseDiscussions").rename("GroupDiscussions");

  return 1;
}
