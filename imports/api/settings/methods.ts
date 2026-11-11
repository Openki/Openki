import { check } from "meteor/check";
import { ServerMethod } from "../../utils/ServerMethod";
import { PrivateSettings, PrivateSettingsPattern } from "../../utils/PrivateSettings";
import { PublicSettings, PublicSettingsPattern } from "../../utils/PublicSettings";

export const checkSettings = ServerMethod(
  "checkSettings",
  // NOTE: There should be a type Match.Error in the "meteor/check" but the current type definition
  // do not define it
  (): (Error | { errorType: "Match.Error"; message: string; path: string })[] => {
    const errors = [];
    try {
      // Check that everything is set as expected in the settings.
      check(PrivateSettings, PrivateSettingsPattern, { throwAllErrors: true });
    } catch (e) {
      if (Array.isArray(e)) {
        errors.push(...e);
      } else {
        errors.push(e);
      }
    }
    try {
      // Check that everything is set as expected in the settings.
      check(PublicSettings, PublicSettingsPattern, { throwAllErrors: true });
    } catch (e) {
      if (Array.isArray(e)) {
        errors.push(...e);
      } else {
        errors.push(e);
      }
    }
    // To comment out a setting we use "_commented" at the end of the name, so we can skip errors for these keys
    return errors.filter((e) => e instanceof Error && !e.message.includes("_commented"));
  },
  { simulation: false },
);
