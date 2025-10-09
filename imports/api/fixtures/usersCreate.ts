import { Log } from "../log/log";
import { ensure } from "./ensureFixture";

export async function usersCreate() {
  // Admins
  await ensure.user("greg");
  await ensure.user("Support", undefined, true, "de"); // used for Zürich Lernt data
  await ensure.user("FeeLing");

  // Users
  await ensure.user("Seee");
  await ensure.user("1u", undefined, true, "de");
  await ensure.user("unverified_email_user", undefined, false);

  Log.record("testdata", ["Users"], { message: "Inserted user fixtures." });
}
