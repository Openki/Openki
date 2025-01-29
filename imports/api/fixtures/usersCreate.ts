import { Log } from "../log/log";
import { ensure } from "./ensureFixture";

export async function usersCreate() {
  await ensure.user("greg", undefined, true);
  await ensure.user("Seee", undefined, true);
  await ensure.user("1u", undefined, true);
  await ensure.user("Support", undefined, true); // used for Zürich Lernt data
  await ensure.user("validated_mail", undefined, true);
  Log.record("testdata", ["Users"], "Inserted user fixtures.");
}
