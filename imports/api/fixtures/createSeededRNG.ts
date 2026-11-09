import seedrandom from "seedrandom";

import { PrivateSettings } from "../../utils/PrivateSettings";

export function createSeededRNG(staticseed: string) {
  return seedrandom(PrivateSettings.prng === "static" ? staticseed : undefined);
}
