import { Meteor } from "meteor/meteor";

if (Meteor.isDevelopment) {
  /**
   * HACK: The HMR is broken since we use a combination of iron:router, Blaze and React for rendering.
   * This can be removed once we replace `iron:router`, blaze and switch to the Rspack Meteor build.
   *
   * NOTE: Imported before other imports in order to run as quickly as possible.
   */
  (function ensureForceReloadAfterHMR() {
    const key = "DEV_HAS_RENDERED_BEFORE";
    if (
      sessionStorage.getItem(key) &&
      // Only trigger a forced reload when the user didn't explicitly reload the page
      // with F5 or the reload button.
      // This prevents double force-reloads and thus cuts reload time in half during development.
      performance.navigation.type !== performance.navigation.TYPE_RELOAD
    ) {
      // Force-reload the page to make sure it's updated.
      // This avoids the infinite loading screen and removes the need for devs
      // to always refresh explicitly for every small change.
      // A full automatic page reload is much better than a broken HMR that requires manual action.
      sessionStorage.removeItem(key);
      window.location.reload();
    } else {
      // In any other case, we simply indicate that the page has rendered
      sessionStorage.setItem(key, "1");
    }
  })();
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
