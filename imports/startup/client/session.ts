import type { dir } from "i18next";

// Define application session variables to allow type-safe access.
// By importing this module at client startup, the types become available for all Meteor.Session API calls
declare module "meteor/session" {
  // oxlint-disable-next-line typescript/no-namespace
  namespace Session {
    interface SessionData {
      top?: number | undefined;
      pleaseLogin?: boolean | undefined;
      visitorUserAllowed?: boolean | undefined;
      region: string;
      locale: string;
      timeLocale?: string | undefined;
      kioskRoute: string;
      kioskFilter?: { region?: string } | undefined;
      OpenedIntro?: boolean | undefined;
      seconds: Date;
      verify?: boolean | undefined;
      textDirectionality?: ReturnType<typeof dir> | undefined;
      emailValidationModalClosed?: boolean | undefined;
      ShowIntro?: boolean | undefined;
      hidePricePolicy?: boolean | undefined;
    }
  }
}

// oxlint-disable-next-line unicorn/require-module-specifiers typescript/no-useless-empty-export
export {};
