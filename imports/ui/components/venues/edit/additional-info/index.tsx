import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";

import { VenueModel, Venues } from "/imports/api/venues/venues";

import "/imports/ui/components/buttons";
import "/imports/ui/components/richtext";
import "/imports/ui/components/map";

import "./styles.scss";

export function AdditionalInfo(){
  return  <div class="venue-edit-additional-info">
  <div class="mb-3">
    <label class="form-label">{{i18n 'venue.edit.shortName' 'Abbreviation'}}</label>
    <div class="input-group">
      <span class="input-group-text">
        <span class="fa-solid fa-hashtag fa-fw" aria-hidden="true"></span>
      </span>
      <input class="form-control js-short"
             placeholder="{{i18n 'venue.edit.short.placeholder' 'short name' attr=true}} {{i18n '_inputField.optional' attr=true}}"
             value="{{short}}">
    </div>
  </div>
  <div class="row gap-3 mb-3">
    <div class="col-md">
      <label class="form-label">
        {{i18n 'venue.edit.max_ppl' 'Max. People'}}
      </label>
      <input type="number" class="form-control js-maxPeople" size="4" value="{{maxPeople}}">
    </div>
    <div class="col-md">
      <label class="form-label">
        {{i18n 'venue.edit.max_workplace' 'Max. Workplaces'}}
      </label>
      <input type="number" class="form-control js-maxWorkplaces" size="4"
             value="{{maxWorkplaces}}">
    </div>
  </div>
  <div class="row gap-3 mb-3">
    <div class="col-md">
      <label class="form-label">{{i18n 'venue.edit.infra' 'Infrastructure'}}</label>
      {{#each facility in facilityOptions}}
        <div class="form-check">
          <input {{facilitiesCheck facility}} id="venueEdit{{facility}}Check">
          <label class="form-check-label" for="venueEdit{{facility}}Check">
            {{i18n (facilitiesDisplay facility)}}
          </label>
        </div>
      {{/each}}
    </div>
    <div class="col-md">
      <label
             class="form-label">{{i18n 'venue.edit.additionalEquipment' 'Additional equipment'}}</label>
      <textarea class="form-control js-otherFacilities">{{otherFacilities}}</textarea>
    </div>
  </div>
</div>
}

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
