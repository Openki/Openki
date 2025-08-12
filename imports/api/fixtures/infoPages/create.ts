import { InfoPages } from "../../infoPages/infoPages";
import { Log } from "../../log/log";
import { infoPages } from "./data/data";

export async function create() {
  for (const p of infoPages) {
    await InfoPages.insertAsync(p);
  }
  Log.record("testdata", ["InfoPages"], { message: "Inserted info pages fixtures." });
}
