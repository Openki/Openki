import "./client-error";
import "./extend-instance";
import "./locale";
import "./templates";
import "./template-helpers";
import "./translations.html";
import "./useraccounts-configuration";

import { Meteor } from "meteor/meteor";
import { Router } from "meteor/iron:router";
import { Session } from "meteor/session";

import * as RegionSelection from "/imports/utils/region-selection";
import * as Theme from "/imports/utils/theme";
import * as Tooltips from "/imports/utils/Tooltips";

import { Introduction } from "/imports/ui/lib/introduction";

import "./bootstrap";

Router.onStop(function () {
  Tooltips.hide();

  // close any verification dialogs still open
  Session.set("verify", false);
});

Meteor.startup(RegionSelection.init);
Meteor.startup(Theme.init);
Meteor.startup(Introduction.init);
