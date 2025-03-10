import { Meteor } from "meteor/meteor";
import { Router } from "meteor/iron:router";
import { Session } from "meteor/session";

import { Alerts } from "/imports/api/alerts/alerts";

import "./client-error";
import "./extend-instance";
import "./locale";
import "./templates";
import "./template-helpers";
import "./translations.html";
import "./useraccounts-configuration";

import * as RegionSelection from "/imports/utils/region-selection";
import * as Theme from "/imports/utils/theme";
import * as Tooltips from "/imports/utils/Tooltips";

import { Introduction } from "/imports/ui/lib/introduction";

import "./bootstrap";
import moment from "moment";

Router.onStop(function () {
  Tooltips.hide();
  setTimeout(() => {
    Alerts.remove({ createdAt: { $gt: moment().subtract(1, "seconds").toDate().valueOf() } });
  }, 1);

  // close any verification dialogs still open
  Session.set("verify", false);
});

Meteor.startup(RegionSelection.init);
Meteor.startup(Theme.init);
Meteor.startup(Introduction.init);
