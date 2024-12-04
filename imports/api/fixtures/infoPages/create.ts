import { InfoPages } from "../../infoPages/infoPages";
import { infoPages } from "./data/data";

export async function create() {
  for (const p of infoPages) {
    // eslint-disable-next-line no-await-in-loop
    await InfoPages.insertAsync(p);
  }
  return "Inserted info pages fixtures.";
}
