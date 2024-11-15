import { InfoPages } from "../../infoPages/infoPages";
import { infoPages } from "./data/data";

export function create() {
  infoPages.forEach((p) => {
    InfoPages.insert(p);
  });
  return "Inserted info pages fixtures.";
}
