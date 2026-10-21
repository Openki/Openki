import { Meteor } from "meteor/meteor";
import { Tracker } from "meteor/tracker";

declare global {
  /** NOTE: This should be removed when the HMR is properly fixed */
  var hasIncomingHMRUpdate: boolean | undefined;
}

/**
 * HACK: The HMR is broken since we use a combination of iron:router, Blaze and React for rendering.
 * NOTE: This should be removed once we replace `iron:router`, blaze and switch to the Rspack Meteor build.
 */
if (Meteor.isDevelopment) {
  const shouldReload = "shouldReload";
  Tracker.autorun(() => {
    const { status } = Meteor.status();

    console.log(status, globalThis.hasIncomingHMRUpdate);
    if (status === "waiting") {
      // Common case: The dev server is restarting because of an HMR update
      globalThis.hasIncomingHMRUpdate = true;
    } else if (status === "connecting" && globalThis.hasIncomingHMRUpdate) {
      // Special case: If a Blaze template or some Meteor client init code was changed,
      // there will be two reloads that clear the browser memory.
      // By only setting this session variable after we detected an incoming HMR update,
      // we can properly reload for both Blaze/Meteor and React changes.
      sessionStorage.setItem(shouldReload, "1");
    } else if (
      // Common case: When the client reconnects to the dev server restarted after an HMR update,
      // then we can update as normal.
      (status === "connected" && globalThis.hasIncomingHMRUpdate) ||
      // Special case: If a Blaze template or some Meteor client init code was changed,
      // then we need to force reload to avoid getting stuck with the loading screen.
      sessionStorage.getItem(shouldReload)
    ) {
      sessionStorage.removeItem(shouldReload);
      window.location.reload();
    }
  });
}

import { Router } from "meteor/iron:router";
import { Session } from "meteor/session";

import { Alerts } from "/imports/api/alerts/alerts";

import "./client-error";
import "./locale";
import "./templates";
import "./template-helpers";
import "./translations.html";
import "./useraccounts-configuration";
import "./c3-oauth";

import * as RegionSelection from "/imports/utils/region-selection";
import * as Theme from "/imports/utils/theme";

import { Introduction } from "/imports/ui/lib/introduction";

import "./bootstrap";
import moment from "moment";

Router.onStop(function () {
  // Remove success message with proposed actions when the user navigates away
  Alerts.remove({
    actions: { $exists: true },
    createdAt: { $lt: moment().subtract(0.5, "seconds").toDate() },
  });

  // close any verification dialogs still open
  Session.set("verify", false);
});

Meteor.startup(RegionSelection.init);
Meteor.startup(Theme.init);
Meteor.startup(Introduction.init);
