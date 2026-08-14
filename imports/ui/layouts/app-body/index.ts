import { Session } from "meteor/session";
import { Meteor } from "meteor/meteor";
import { Router } from "meteor/iron:router";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";

import { Regions } from "/imports/api/regions/regions";

import * as RegionSelection from "/imports/utils/region-selection";
import { ScssVars } from "/imports/ui/lib/scss-vars";
import { routerAutoscroll } from "/imports/ui/lib/router-autoscroll";
import * as Tooltips from "/imports/utils/Tooltips";
import * as FormsValidation from "/imports/utils/FormsValidation";

import "/imports/ui/layouts/root.html";
import "/imports/ui/components/account-tasks";
import "/imports/ui/components/alerts";
import "/imports/ui/components/email-validation";
import "../../components/featured-organization";
import "/imports/ui/components/footer";
import "/imports/ui/components/introduction";
import "/imports/ui/components/kiosk-link";
import "/imports/ui/components/navbar";
import "/imports/ui/components/reset-password-email-sent";
import "/imports/ui/components/regions/splash";

import "./template.html";

const Template = TemplateAny as TemplateStaticTyped<"layout">;

const template = Template.layout;

template.helpers({
  showRegionSplash() {
    const { route } = Router.current();
    if (!route) {
      return false;
    }

    return (
      RegionSelection.regionDependentRoutes.includes(route.getName()) &&
      Session.equals("showRegionSplash", true)
    );
  },

  isResetPasswordEmailSent() {
    return Router.current().params.query?.action === "resetPasswordEmailSent";
  },

  hasPricePolicy() {
    return !Regions.currentRegion()?.isPrivate();
  },

  isAdminPage() {
    return Router.current().url.includes("/admin/");
  },

  isAdmin() {
    return Meteor.user()?.hasPrivilege("admin");
  },

  isNotAdminPanel() {
    const { route } = Router.current();
    return !(route?.getName() === "adminPanel");
  },
});

template.onRendered(() => {
  Tooltips.enable();
  FormsValidation.enable();
});

routerAutoscroll.marginTop = ScssVars.navbarHeight;
