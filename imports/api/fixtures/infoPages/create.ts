import { InfoPages } from "../../infoPages/infoPages";
import { infoPages } from "./data/data";

export function create() {
  for (const p of infoPages) {
    InfoPages.insertAsync(p);
  }
  return "Inserted info pages fixtures.";
}
