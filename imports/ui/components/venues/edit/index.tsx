import { Mongo } from "meteor/mongo";
import { Router } from "meteor/iron:router";
import { i18n } from "/imports/startup/both/i18next";
import { ReactiveVar } from "meteor/reactive-var";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";
import { Session } from "meteor/session";

import * as Alert from "/imports/api/alerts/alert";
import { Regions } from "/imports/api/regions/regions";
import { FacilityOption, VenueModel } from "/imports/api/venues/venues";
import * as VenuesMethods from "/imports/api/venues/methods";

import { LocationTracker, MarkerEntity } from "/imports/ui/lib/location-tracker";
import { PleaseLogin } from "/imports/ui/lib/please-login";
import * as Analytics from "/imports/ui/lib/analytics";
import { CleanedRegion } from "/imports/ui/lib/cleaned-region";

import "/imports/ui/components/buttons";
import "/imports/ui/components/richtext";
import "/imports/ui/components/map";
import "./additional-info";
import type { Data as AdditionalInfoData } from "./additional-info";

import "./styles.scss";

export function Edit(){
  return  <div class="edit-page venue-edit">
  {{#if _id}}
    <h2>{{i18n 'venue.edit.title' 'Edit venue'}}</h2>
  {{else}}
    <h2>{{i18n 'venue.edit.titleCreate' 'Create new venue'}}</h2>
  {{/if}}
  <form>
    <div class="mb-3">
      <label class="form-label">{{i18n 'venue.edit.name' 'Name'}}</label>
      <input type="text" class="js-name form-control form-control-lg"
             placeholder="{{i18n 'venue.edit.namePlaceholder' 'Full name of venue' attr=true}}"
             size="60" value="{{name}}">
    </div>
    <div class="mb-3">
      <label class="form-label">{{i18n 'venue.edit.description' 'Description'}}</label>
      {{> richtext className="js-description" text=description placeholder=(i18n 'venue.edit.description.placeholder' 'Some words about this venue')}}
    </div>
    {{#if showMapSelection}}
      <div class="row gap-3 mb-3">
        {{#if regionSelectable}}
          <div class="col-md">
            <label class="form-label">{{i18n 'venue.edit.region' 'Region'}}</label>
            <div class="input-group">
              <span class="input-group-text">
                <span class="fa-solid fa-location-dot" aria-hidden="true"></span>
              </span>
              <select name='region' class="form-select js-region">
                <option value=''>
                  {{i18n 'venue.edit.pls_select' 'Please select'}}
                </option>
                {{#each region in regions}}
                  <option value='{{region._id}}'>{{region.name}}</option>
                {{/each}}
              </select>
            </div>
          </div>
        {{/if}}
        {{#if regionSelected}}
          <div class="col-md">
            <label
                   class="form-label">{{i18n 'venue.edit.map' 'Please add location by clicking "+" (on the right inside the map)'}}</label>
            {{> map markers=venueMarkers allowPlacing=allowPlacing allowRemoving=allowRemoving}}
          </div>
        {{/if}}
      </div>
    {{/if}}

    <div class="mb-3">
      <label class="form-label">{{i18n 'venue.edit.address' 'Address'}}</label>
      <div class="input-group">
        <span class="input-group-text">
          <span class="fa-solid fa-location-dot fa-fw" aria-hidden="true"></span>
        </span>
        <input class="form-control js-address"
               placeholder="{{i18n 'venue.edit.address.placeholder' 'Street, City, State' attr=true}}"
               value="{{address}}">

      </div>
    </div>

    <div class="mb-3">
      <label class="form-label" for="editform-address">{{i18n 'venue.details.route'}}</label>
      <div class="input-group">
        <span class="input-group-text">
          <span class="fa-solid fa-signs-post"></span>
        </span>
        <textarea class="form-control js-route" id="editform-address"
                  placeholder="{{i18n 'venue.route.placeholder' 'near busstop, cross fence, then backyard, enter the black door… 23rd floor, then left.' attr=true}}"
                  value="{{route}}"></textarea>
      </div>
    </div>
    <div class="mb-3">
      <label
             class="form-label">{{i18n 'venue.edit.additionalInfo' 'Additional info (optional, but helps others find the venue)'}}</label><br />
      {{#if showAdditionalInfo}}
        <button type="button" class="btn btn-cancel btn-block js-toggle-additional-info-btn">
          {{i18n 'venue.edit.hideAdditionalInfo' 'Hide additional info'}}
        </button>
      {{else}}
        <button type="button" class="btn btn-secondary btn-block js-toggle-additional-info-btn">
          {{i18n 'venue.edit.provideAdditionalInfo' 'Fill out additional info'}}
        </button>
      {{/if}}
      <div {{displayAdditionalInfo}}>
        {{> venueEditAdditionalInfo additionalInfoAttr}}
      </div>
    </div>
    <div class="form-actions">
      {{> buttonSave saving=saving}}
      {{> buttonCancel event="js-edit-cancel"}}
    </div>
  </form>
</div>
}

const Template = TemplateAny as TemplateStaticTyped<
  "venueEdit",
  VenueModel,
  {
    showAdditionalInfo: ReactiveVar<boolean>;
    isNew: boolean;
    locationTracker: LocationTracker;
    short: ReactiveVar<string>;
    maxPeople: ReactiveVar<number>;
    maxWorkplaces: ReactiveVar<number>;
    facilities: ReactiveVar<FacilityOption[]>;
    otherFacilities: ReactiveVar<string | undefined>;
    selectedRegion: ReactiveVar<string | undefined | null>;
    regionSelectable: ReactiveVar<boolean>;
  }
>;

const template = Template.venueEdit;

template.onCreated(function () {
  const instance = this;

  instance.busy(false);

  instance.showAdditionalInfo = new ReactiveVar(false);
  instance.isNew = !instance.data._id;

  instance.locationTracker = new LocationTracker();
  instance.locationTracker.setLocation(instance.data, true);

  instance.short = new ReactiveVar(instance.data.short);
  instance.maxPeople = new ReactiveVar(instance.data.maxPeople);
  instance.maxWorkplaces = new ReactiveVar(instance.data.maxWorkplaces);
  instance.facilities = new ReactiveVar(
    Object.entries(instance.data.facilities)
      .filter((f) => f[1])
      .map((f) => f[0] as FacilityOption),
  );
  instance.otherFacilities = new ReactiveVar(instance.data.otherFacilities);

  instance.selectedRegion = new ReactiveVar(undefined);
  instance.regionSelectable = new ReactiveVar(false);
  if (instance.isNew) {
    instance.autorun(() => {
      // If the session sets the region, we use it
      const sessionRegion = CleanedRegion(Session.get("region"));

      instance.selectedRegion.set(sessionRegion);

      // If the session does not give us a region, we let the user select it
      instance.regionSelectable.set(!sessionRegion);
    });
  } else {
    // For existing venues the region is already selected and cannot
    // be changed
    instance.selectedRegion.set(this.data.region);
  }

  instance.autorun(() => {
    const regionId = instance.selectedRegion.get();
    if (!regionId) {
      return;
    }
    instance.locationTracker.setRegion(regionId);
  });

  instance.locationTracker.markers.find().observe({
    added(orginalLocation) {
      if ("proposed" in orginalLocation && orginalLocation.proposed) {
        // The map widget does not reactively update markers when their
        // flags change. So we remove the propsed marker it added and
        // replace it by a main one. This is only a little weird.
        instance.locationTracker.markers.remove({ proposed: true });

        const location = {
          ...orginalLocation,
          main: true,
          draggable: true,
          proposed: undefined,
        } as Mongo.OptionalId<MarkerEntity>;
        instance.locationTracker.markers.insert(location);
      }
    },

    changed(location) {
      if ("remove" in location && location.remove) {
        instance.locationTracker.markers.remove(location._id);
      }
    },
  });
});

template.helpers({
  displayAdditionalInfo() {
    return {
      style: `display: ${Template.instance().showAdditionalInfo.get() ? "block" : "none"}`,
    };
  },

  showAdditionalInfo() {
    return Template.instance().showAdditionalInfo.get();
  },

  additionalInfoAttr(): AdditionalInfoData {
    const instance = Template.instance();
    const data: AdditionalInfoData["data"] = {
      short: instance.short.get(),
      maxPeople: instance.maxPeople.get(),
      maxWorkplaces: instance.maxWorkplaces.get(),
      facilities: instance.facilities.get(),
    };
    const otherFacilities = instance.otherFacilities.get();
    if (otherFacilities) {
      data.otherFacilities = otherFacilities;
    }
    return {
      data,
      onShortChange: (newValue) => {
        instance.short.set(newValue);
      },
      onMaxPeopleChange: (newValue) => {
        instance.maxPeople.set(newValue);
      },
      onMaxWorkplacesChange: (newValue) => {
        instance.maxWorkplaces.set(newValue);
      },
      onFacilitiesChange: (newValue) => {
        instance.facilities.set(newValue);
      },
      onOtherFacilitiesChange: (newValue) => {
        instance.otherFacilities.set(newValue);
      },
    };
  },

  showMapSelection() {
    const instance = Template.instance();

    return instance.regionSelectable.get() || !!instance.selectedRegion.get();
  },

  regionSelectable() {
    return Template.instance().regionSelectable.get();
  },

  regionSelected() {
    return !!Template.instance().selectedRegion.get();
  },

  venueMarkers() {
    return Template.instance().locationTracker.markers;
  },

  allowPlacing() {
    const { locationTracker } = Template.instance();

    // We return a function so the reactive dependency on locationState is
    // established from within the map template which will call it.
    return () =>
      // We only allow placing if we don't have a selected location yet
      !locationTracker.getLocation();
  },

  allowRemoving() {
    const { locationTracker } = Template.instance();

    return () => !!locationTracker.getLocation();
  },
});

template.events({
  submit(event, instance) {
    event.preventDefault();

    const data = Template.currentData();

    const changes: VenuesMethods.SaveFields = {
      name: instance.$(".js-name").val() as string,
      address: instance.$(".js-address").val() as string,
      route: instance.$(".js-route").val() as string,
      short: instance.short.get(),
      maxPeople: instance.maxPeople.get(),
      maxWorkplaces: instance.maxWorkplaces.get(),
      facilities: instance.facilities.get(),
    };
    const otherFacilities = instance.otherFacilities.get();
    if (otherFacilities) {
      changes.otherFacilities = otherFacilities;
    }

    if (!changes.name) {
      Alert.error(i18n("venue.create.plsGiveVenueName", "Please give your venue a name"));
      return;
    }

    const $description = instance.$(".js-description");
    if (!$description.text()) {
      Alert.error(
        i18n("venue.create.plsProvideDescription", "Please provide a description for your venue"),
      );
      return;
    }

    changes.description = $description.html();

    if (instance.isNew) {
      const region = instance.selectedRegion.get();
      if (!region) {
        Alert.error(i18n("venue.create.plsSelectRegion", "Please select a region"));
        return;
      }
      changes.region = region;
    }

    const loc = instance.locationTracker.getLocation();
    if (loc) {
      changes.loc = loc;
    } else {
      Alert.error(i18n("venue.create.plsSelectPointOnMap", "Please select a point on the map"));
      return;
    }

    const venueId = data._id || "";
    instance.busy("saving");
    PleaseLogin(instance, async () => {
      try {
        const res = await VenuesMethods.save(venueId, changes);

        Alert.success(
          i18n("venue.saving.success", 'Saved changes to venue "{NAME}".', {
            NAME: changes.name,
          }),
        );

        if (instance.isNew) {
          Analytics.trackEvent(
            "Venue creations",
            "Venue creations",
            Regions.findOne(changes.region)?.nameEn,
          );

          Router.go("venueDetails", { _id: res });
        } else {
          (instance.parentInstance() as any).state.set("editing", false);
        }
      } catch (err) {
        Alert.serverError(err, i18n("venue.saving.error", "Could not save the venue"));
      } finally {
        instance.busy(false);
      }
    });
  },

  "click .js-toggle-additional-info-btn"(_event, instance) {
    instance.showAdditionalInfo.set(!instance.showAdditionalInfo.get());
  },

  "click .js-edit-cancel"(_event, instance) {
    if (instance.isNew) {
      Router.go("/");
    } else {
      (instance.parentInstance() as any).state.set("editing", false);
    }
  },

  "change .js-region"(_event, instance) {
    instance.selectedRegion.set(instance.$(".js-region").val() as string);
  },
});
