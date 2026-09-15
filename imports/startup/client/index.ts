import { Meteor } from "meteor/meteor";
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
import * as Tooltips from "/imports/utils/Tooltips";

import { Introduction } from "/imports/ui/lib/introduction";

import "./bootstrap";
import moment from "moment";

Router.onStop(function () {
  Tooltips.hide();

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
