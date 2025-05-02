import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";
import moment from "moment-timezone";

import { RegionEntity } from "/imports/api/regions/regions";

import { LocationTracker, MainMarkerEntity } from "/imports/ui/lib/location-tracker";

import "/imports/ui/components/buttons";
import "/imports/ui/components/editable";
import "/imports/ui/components/map";

import "./template.html";

const Template = TemplateAny as TemplateStaticTyped<
  "regionEditFields",
  { locationTracker: LocationTracker; region: RegionEntity }
>;

const template = Template.regionEditFields;

template.onCreated(function () {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const instance = this;
  instance.busy(false);

  const { locationTracker, region } = instance.data;

  locationTracker.setLocation(region, true);

  locationTracker.markers.find().observe({
    added(orginalLocation) {
      if ("proposed" in orginalLocation && orginalLocation.proposed) {
        // The map widget does not reactively update markers when their
        // flags change. So we remove the propsed marker it added and
        // replace it by a main one. This is only a little weird.
        locationTracker.markers.remove({ proposed: true });

        const location = {
          ...orginalLocation,
          main: true,
          draggable: true,
          proposed: undefined,
        } as MainMarkerEntity;
        locationTracker.markers.insert(location);
      }
    },

    changed(location) {
      if ("remove" in location && location.remove) {
        locationTracker.markers.remove(location._id);
      }
    },
  });
});

template.helpers({
  regionMarkers() {
    const { locationTracker } = Template.instance().data;
    return locationTracker.markers;
  },

  timezones() {
    return moment.tz.names();
  },

  isCurrentTimezone(timezone: string) {
    const { region } = Template.instance().data;
    return region.tz === timezone;
  },

  allowPlacing() {
    const { locationTracker } = Template.instance().data;

    // We return a function so the reactive dependency on locationState is
    // established from within the map template which will call it.
    return () =>
      // We only allow placing if we don't have a selected location yet
      !locationTracker.getLocation();
  },

  allowRemoving() {
    const { locationTracker } = Template.instance().data;

    return () => !!locationTracker.getLocation();
  },
});

export function Fields(){
  return <div class="mb-3">
  <label class="form-label">{{i18n 'region.edit.name' 'Name:'}}</label>
  <input type="text" class="js-name form-control form-control-lg"
         placeholder="{{i18n 'region.edit.namePlaceholder' 'Full name of region' attr=true}}"
         value="{{region.name}}">
</div>
<div class="mb-3 clearfix">
  <label
         class="form-label">{{i18n 'region.edit.map' 'Please add the center of the region by clicking "+" (on the right inside the map)'}}</label>
  {{> map markers=regionMarkers maxZoom=16 allowPlacing=allowPlacing allowRemoving=allowRemoving}}
</div>

<div class="mb-3">
  <label class="form-label">{{i18n 'region.edit.timezone' 'Timezone:'}}</label>
  <select class="form-select js-timezone" name='region'>
    <option value='' disabled selected="{{#unless region.timezone}}selected{{/unless}}"
            class="select-placeholder">
      {{i18n '_selection.pleaseSelect'}}
    </option>
    {{#each timezone in timezones}}
      <option value='{{timezone}}' selected="{{#if isCurrentTimezone timezone}}selected{{/if}}">
        {{timezone}}
      </option>
    {{/each}}
  </select>
</div>
<div class="mb-3">
  <label for="region-description-id"
         class="form-label">{{i18n 'region.edit.descriptionLabel' 'Description:'}}</label>
  <textarea id="region-description-id" class="js-description form-control"
            placeholder="{{i18n 'region.edit.descriptionPlaceholder' 'An optional description' attr=true}}"
            value="{{region.description}}"></textarea>
</div>
}
