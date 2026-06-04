import { MongoInternals } from "meteor/mongo";

export async function update() {
  const rawDb = MongoInternals.defaultRemoteCollectionDriver().mongo.db;

  const DB_UpdatesApplied = await rawDb.collection("UpdatesApplied").find().toArray();
  const existingCollections = await rawDb.listCollections(undefined, { nameOnly: true }).toArray();

  console.log("DB updates already applied:");
  console.dir({ DB_UpdatesApplied }, { depth: 4 });

  console.log("\nExisting collections and already renamed ones:");
  console.dir(
    {
      existingCollections,
      alreadyRenamedCollections: existingCollections.filter((collection) =>
        collection.name.includes("DbMigrate"),
      ),
    },
    { depth: 4 },
  );

  if (
    existingCollections.some(
      (collection) => collection.name === "Organizations_forDeleteAfterDbMigrate",
    )
  ) {
    console.error(
      'NOTE: collection "Organizations_forDeleteAfterDbMigrate" already exists! Maybe this migration was previously attempted but did not complete successfully?',
    );
  }

  if (existingCollections.some((collection) => collection.name === "Organizations")) {
    console.log(
      "Collection Organizations already exists. Attempting to rename but this will likely fail if the rename target already exists",
    );
    await rawDb.collection("Organizations").rename("Organizations_forDeleteAfterDbMigrate");
  }
  await rawDb.collection("Groups").rename("Organizations");

  return 1;
}
