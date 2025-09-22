import { Log } from "../log/log";
import { ensure } from "./ensureFixture";

export async function usersCreate() {
  await ensure.user("greg");
  await ensure.user("Seee");
  await ensure.user("1u");
  await ensure.user("Support"); // used for Zürich Lernt data
  await ensure.user("validated_mail");
  Log.record("testdata", ["Users"], { message: "Inserted user fixtures." });
}
