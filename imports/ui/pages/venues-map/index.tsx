import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";
import { Mongo } from "meteor/mongo";
import { i18n } from "/imports/startup/both/i18next";

import { Regions } from "/imports/api/regions/regions";
import { VenueEntity, VenueModel } from "/imports/api/venues/venues";

import * as Metatags from "/imports/utils/metatags";

import { LocationTracker, MarkerEntity } from "/imports/ui/lib/location-tracker";

import "/imports/ui/components/map";
import "./location-candidate";

import "./template.html";
import "./styles.scss";

export interface Data {
  region: string | undefined;
  venues: Mongo.Cursor<VenueEntity, VenueModel>;
}

const Template = TemplateAny as TemplateStaticTyped<
  "venuesMapPage",
  Data,
  {
    locationTracker: LocationTracker;
  }
>;

const template = Template.venuesMapPage;

template.onCreated(function () {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const instance = this;

  instance.autorun(() => {
    Metatags.setCommonTags(i18n("venue.map.windowtitle", "Venues map"));
  });

  instance.locationTracker = new LocationTracker();

  instance.autorun(() => {
    const { region, venues } = Template.currentData();

    instance.locationTracker.clearRegion();
    if (region) {
      instance.locationTracker.setRegion(region);
    }

    // Here we assume venues are not changed or removed.
    instance.locationTracker.markers.remove({});

    venues.observe({
      added(originalLocation) {
        const location = {
          ...originalLocation,
          proposed: true,
          preset: true,
          presetName: originalLocation.name,
          presetAddress: originalLocation.address,
        } as MarkerEntity;
        instance.locationTracker.markers.insert(location);
      },
    });
  });
});

template.helpers({
  venues() {
    return Template.instance().locationTracker.markers.find();
  },

  haveVenues() {
    return Template.instance().locationTracker.markers.find().count() > 0;
  },

  venueMarkers() {
    return Template.instance().locationTracker.markers;
  },

  regionName() {
    const { region } = Template.instance().data;
    return Regions.findOne(region)?.name || false;
  },

  handles() {
    const instance = Template.instance();
    const { markers } = instance.locationTracker;
    return {
      onMouseEnter: (id: string) => {
        markers.update({}, { $set: { hover: false } }, { multi: true });
        markers.update(id, { $set: { hover: true } });
      },
      onMouseLeave: () => {
        markers.update({}, { $set: { hover: false } }, { multi: true });
      },
    };
  },
});

export function VenuesMap(){
  return   <div class="container-fluid">
    <h1>
      {{#if regionName}}
        {{i18n 'venues.list.titleForRegion' 'Venues in region {REGION}' REGION=regionName}}
      {{else}}
        {{i18n 'venues.list.title' 'Venues'}}
      {{/if}}
    </h1>
    <div class="row">
      <div class="col-2 d-none d-md-block">
        {{#if haveVenues}}
          <ul class="list-group">
            {{#each venue in venues}}
              {{> locationCandidate marker=venue handles=handles}}
            {{/each}}
          </ul>
        {{else}}
          {{i18n 'venues.list.noneFound' "No venues found"}}
        {{/if}}
        <a class="btn btn-secondary mt-3"
           href="{{pathFor 'venueDetails' _id='create'}}">{{i18n 'profile.createNewVenue.button'}}</a>
      </div>
      <div class="col-12 col-md-10 venues-map-location-map">
        {{> map markers=venueMarkers}}
      </div>
    </div>
  </div>
}
