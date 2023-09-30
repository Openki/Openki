import seedrandom from "seedrandom";

import { PrivateSettings } from "/imports/utils/PrivateSettings";

export function Prng(staticseed: string) {
  return seedrandom(PrivateSettings.prng === "static" ? staticseed : undefined);
}
