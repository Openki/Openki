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
