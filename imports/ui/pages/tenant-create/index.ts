import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";
import { Router } from "meteor/iron:router";

import * as Alert from "/imports/api/alerts/alert";
import { TenantModel } from "/imports/api/tenants/tenants";
import { RegionModel } from "/imports/api/regions/regions";
import * as TenantsMethods from "/imports/api/tenants/methods";
import * as RegionsMethods from "/imports/api/regions/methods";

import { LocationTracker } from "/imports/ui/lib/location-tracker";
import { PleaseLogin } from "/imports/ui/lib/please-login";
import * as Analytics from "/imports/ui/lib/analytics";
import { i18n } from "/imports/startup/both/i18next";
import * as Metatags from "/imports/utils/metatags";

import "/imports/ui/components/buttons";
import "/imports/ui/components/editable";
import "/imports/ui/components/map";

import "/imports/ui/components/regions/display";
import "/imports/ui/components/regions/edit";

import "./template.html";

export interface Data {
  tenant: TenantModel;
  retion: RegionModel;
}

const Template = TemplateAny as TemplateStaticTyped<
  "tenantCreatePage",
  Data,
  {
    locationTracker: LocationTracker;
  }
>;

const template = Template.tenantCreatePage;

template.onCreated(function () {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const instance = this;

  instance.autorun(() => {
    Metatags.setCommonTags(i18n("tenant.edit.siteTitle.create", "Create private region"));
  });

  instance.busy(false);

  instance.locationTracker = new LocationTracker();
});

template.helpers({
  locationTracker() {
    return Template.instance().locationTracker;
  },
});

template.events({
  submit(event, instance) {
    event.preventDefault();

    const tenantName = instance.$(".js-tenant-name").val() as string;
    if (!tenantName) {
      Alert.error(i18n("tenant.create.plsGiveName", "Please give a organization name"));
      return;
    }

    const name = instance.$(".js-name").val() as string;
    if (!name) {
      Alert.error(i18n("tenant.region.create.plsGiveName", "Please give your region a name"));
      return;
    }

    const loc = instance.locationTracker.getLocation();
    if (!loc) {
      Alert.error(
        i18n(
          "tenant.region.create.plsSelectPointOnMap",
          'Please add a marker on the map by clicking on the "+" sign.',
        ),
      );
      return;
    }

    const changes: Omit<RegionsMethods.CreateFields, "tenant"> = {
      name,
      tz: instance.$(".js-timezone").val() as string,
      loc,
      description: instance.$(".js-description").val() as string,
    };

    instance.busy("saving");
    PleaseLogin(instance, async () => {
      try {
        const tenantId = await TenantsMethods.create({ name: tenantName });
        await RegionsMethods.create({ tenant: tenantId, ...changes });

        Router.go("tenantDetails", { _id: tenantId });

        Alert.success(
          i18n("privateRegion.saving.success", 'Created region "{NAME}".', {
            NAME: changes.name,
          }),
        );

        Analytics.trackEvent("Tenant creations", "Tenant with region creations");
      } catch (err) {
        Alert.serverError(
          err,
          i18n("privateRegion.creating.error", "Creating the region went wrong"),
        );
      } finally {
        instance.busy(false);
      }
    });
  },

  "click .js-edit-cancel"() {
    Router.go("profile");
  },
});
