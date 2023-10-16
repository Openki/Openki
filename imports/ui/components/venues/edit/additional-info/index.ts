import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";

import { VenueModel, Venues } from "/imports/api/venues/venues";

import "/imports/ui/components/buttons";
import "/imports/ui/components/richtext";
import "/imports/ui/components/map";

import "./template.html";
import "./styles.scss";

const Template = TemplateAny as TemplateStaticTyped<"venueEditAdditionalInfo", VenueModel>;

const template = Template.venueEditAdditionalInfo;

template.helpers({
  facilityOptions() {
    return Venues.facilityOptions;
  },
  facilitiesCheck(name: string) {
    const data = Template.currentData();

    const attrs: {
      class: string;
      type: string;
      value: string;
      checked?: string;
    } = {
      class: `form-check-input js-${name}`,
      type: "checkbox",
      value: "",
    };
    if (data.facilities[name]) {
      attrs.checked = "checked";
    }
    return attrs;
  },
  facilitiesDisplay(name: string) {
    return `venue.facility.${name}`;
  },
});
