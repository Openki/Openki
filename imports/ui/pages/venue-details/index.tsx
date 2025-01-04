import { Router } from "meteor/iron:router";
import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { ReactiveVar } from "meteor/reactive-var";
import { ReactiveDict } from "meteor/reactive-dict";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";

import * as Events from "/imports/api/events/publications";
import { Geodata, RegionModel, Regions } from "/imports/api/regions/regions";
import * as Alert from "/imports/api/alerts/alert";
import { VenueModel } from "/imports/api/venues/venues";
import * as VenuesMethods from "/imports/api/venues/methods";
import { EventEntity, EventModel } from "/imports/api/events/events";

import { reactiveNow } from "/imports/utils/reactive-now";
import { i18n } from "/imports/startup/both/i18next";
import * as Metatags from "/imports/utils/metatags";
import { textPlain } from "/imports/utils/html-tools";
import { truncate } from "/imports/utils/string-tools";

import { CenteredMarkerEntity, MainMarkerEntity } from "/imports/ui/lib/location-tracker";

import type { Props as DeleteConfirmDialogProps } from "/imports/ui/components/delete-confirm-dialog";

import "./styles.scss";

const UpcomingEventLimitDefault = 12;
const PastEventLimitDefault = 3;
const EventLoadingBlockSize = 9;

export function VenueDetailsPage(){
  return  <div class="container mw-md">
  {{#if state 'editing'}}
    {{> venueEdit venueEditAttr}}
  {{else}}
    <div class="page-component">
      <div class="details-header location-details-header">
        {{#if this.venue.picture}}
          <img src="{{this.venue.picture}}">
        {{/if}}
        <h3>
          {{this.venue.name}}
          {{#if this.venue.short}}
            <small>{{this.venue.short}}</small>
          {{/if}}
        </h3>
        <p>{{{this.venue.description}}}</p>
      </div>

      <div class="details-body location-details-body">
        <div class="details-content">
          <div class="row">
            <div class="{{#if this.venue.loc}}col-md-7{{else}}col{{/if}}">
              {{#if this.venue.editor}}
                <p>
                  <span
                        class="venue-property-title">{{i18n 'location.details.hosts' 'Hosts:'}}</span>
                <ul class='hosts'>
                  <li>
                    {{> profileLink userId=this.venue.editor}}
                    {{contribution this.venue.editor}}
                  </li>
                </ul>
                </p>
              {{/if}}
              {{#if this.venue.address}}
                <p>
                  <span class="venue-property-title">
                    {{i18n 'venue.details.address' 'Address:'}}
                  </span>
                  {{this.venue.address}}
                </p>
              {{/if}}
              {{#if this.venue.route}}
                <p>
                  <span class="venue-property-title">
                    {{i18n 'venue.details.route' 'How to go there:'}}
                  </span>
                  <br>
                  <span style="white-space: pre-line;">{{this.venue.route}}</span>
                </p>
              {{/if}}
              {{#if this.venue.maxPeople}}
                <p>
                  <span class="venue-property-title">
                    {{i18n 'venue.details.max_ppl' 'Maximum People:'}}
                  </span>
                  {{this.venue.maxPeople}}
                </p>
              {{/if}}
              {{#if this.venue.maxWorkplaces}}
                <p>
                  <span class="venue-property-title">
                    {{i18n 'venue.details.max_workplaces' 'Maximum Workplaces:'}}
                  </span>
                  {{this.venue.maxWorkplaces}}
                </p>
              {{/if}}
              {{#if facilityNames this.venue}}
                <p>
                  <span class="venue-property-title">
                    {{i18n 'venue.details.availableInfrastructure' 'Available infrastructure:'}}
                  </span>
                <ul>
                  {{#each facilityName in (facilityNames this.venue)}}
                    <li>{{facilitiesDisplay facilityName}}</li>
                  {{/each}}
                </ul>
                </p>
              {{/if}}
              {{#if this.venue.otherFacilities}}
                <p>
                  <span class="venue-property-title">
                    {{i18n 'venue.details.additionalEquipment' 'Additional equipment:'}}
                  </span>
                  <br>
                  {{this.venue.otherFacilities}}
                </p>
              {{/if}}
            </div>
            {{#if this.venue.loc}}
              <div class="col-md-5">
                <div class="details-map">
                  {{> locationDisplay coordinates=this.venue.loc.coordinates}}
                  <div class="coordinates">
                    <a href="{{geoLocationLink this.venue.loc}}">
                      {{i18n 'venueDetails.coordinates' 'Coordinates:'}}
                      {{locationFormat this.venue.loc}}
                    </a>
                  </div>
                </div>
              </div>
            {{/if}}
          </div>
        </div>
      </div>
      {{#if mayEdit this.venue}}
        <div class="actions">
          {{> buttonEdit event="js-venue-edit"}}
          {{#unless state 'verifyDelete'}}
            {{> buttonDelete event="js-venue-delete"}}
          {{/unless}}
        </div>
        {{#if state 'verifyDelete'}}
          {{> deleteConfirmDialog deleteConfirmDialogAttr}}
        {{/if}}
      {{/if}}
    </div>
  {{/if}}
  {{#if upcomingEvents}}
    <div class="page-component">
      <h2>{{i18n 'venue.details.upcomingEvents' "Upcoming events at this venue:"}}</h2>
      {{> eventList dataEvents=upcomingEvents withDate=true withVenue=false}}
      {{#if hasMoreUpcomingEvents}}
        <div class="clearfix"></div>
        <button type="button" class="btn btn-add js-show-more-upcoming-events">
          {{i18n '_button.more'}}
        </button>
      {{/if}}
    </div>
  {{/if}}
  {{#if pastEvents}}
    <div class="page-component">
      <h2>{{i18n 'venue.details.pastEvents' "Past events:"}}</h2>
      {{> eventList dataEvents=pastEvents withDate=true withVenue=false}}
      {{#if hasMorePastEvents}}
        <div class="clearfix"></div>
        <button type="button" class="btn btn-add js-show-more-past-events">
          {{i18n '_button.more'}}
        </button>
      {{/if}}
    </div>
  {{/if}}
</div>
} 

const Template = TemplateAny as TemplateStaticTyped<
  "venueDetailsPage",
  { venue: VenueModel },
  {
    upcomingEvents: ReactiveVar<Mongo.Cursor<EventEntity, EventModel> | undefined>;
    pastEvents: ReactiveVar<Mongo.Cursor<EventEntity, EventModel> | undefined>;
    state: ReactiveDict<{
      editing: boolean;
      verifyDelete: boolean;
      upcomingEventLimit: number;
      pastEventLimit: number;
    }>;
    markers: Mongo.Collection<MainMarkerEntity | CenteredMarkerEntity>;
    setLocation: (loc?: Geodata) => void;
    setRegion: (region: RegionModel | undefined) => void;
  }
>;

const template = Template.venueDetailsPage;

template.onCreated(function () {
  const instance = this;

  instance.autorun(() => {
    const { venue } = Template.currentData();
    let title;
    if (venue._id) {
      title = venue.name;
    } else {
      title = i18n("venue.edit.siteTitle.create", "Create Venue");
    }
    Metatags.setCommonTags(title, truncate(textPlain(venue.description || ""), 160));
  });

  instance.busy();

  instance.upcomingEvents = new ReactiveVar(undefined);
  instance.pastEvents = new ReactiveVar(undefined);
  instance.state = new ReactiveDict();
  instance.state.setDefault({
    editing: false,
    verifyDelete: false,
    upcomingEventLimit: UpcomingEventLimitDefault,
    pastEventLimit: PastEventLimitDefault,
  });

  instance.markers = new Mongo.Collection(null); // Local collection for in-memory storage

  instance.autorun(() => {
    const { venue } = Template.currentData();
    instance.state.set("editing", !venue._id);
  });

  instance.setLocation = (loc) => {
    instance.markers.remove({ main: true });
    if (loc) {
      instance.markers.insert({ loc, main: true });
    }
  };

  instance.setRegion = (region) => {
    instance.markers.remove({ center: true });
    if (region?.loc) {
      instance.markers.insert({ loc: region.loc, center: true });
    }
  };

  instance.autorun(() => {
    const { venue } = Template.currentData();
    if (!venue._id) {
      return;
    }

    const limit = instance.state.get("upcomingEventLimit") || UpcomingEventLimitDefault;

    const now = reactiveNow.get();
    const filter = { venue: venue._id, after: now };

    // Add one to the limit so we know there is more to show
    Events.findFilter
      .subscribe(instance, filter, limit + 1)()
      .then((r) => {
        instance.upcomingEvents.set(r);
      });
  });

  instance.autorun(() => {
    const { venue } = Template.currentData();
    if (!venue._id) {
      return;
    }

    const limit = instance.state.get("pastEventLimit") || PastEventLimitDefault;

    const now = reactiveNow.get();
    const filter = { venue: venue._id, before: now };

    // Add one to the limit so we know there is more to show
    Events.findFilter
      .subscribe(instance, filter, limit + 1)()
      .then((r) => {
        instance.pastEvents.set(r);
      });
  });
});

template.onRendered(function () {
  const instance = this;

  instance.busy(false);

  instance.autorun(() => {
    const { venue } = Template.currentData();

    instance.setLocation(venue.loc);

    const region = Regions.findOne(venue.region || undefined);
    instance.setRegion(region);
  });
});

template.helpers({
  mayEdit(venue: VenueModel) {
    return venue.editableBy(Meteor.user());
  },

  facilityNames(venue: VenueModel) {
    return Object.keys(venue.facilities);
  },

  facilitiesDisplay(name: string) {
    return i18n(`venue.facility.${name}`);
  },

  upcomingEvents() {
    const instance = Template.instance();
    const events = instance.upcomingEvents.get()?.fetch() || [];

    if (events.length > (instance.state.get("upcomingEventLimit") || 0)) {
      // The last event is to check if there are any more.
      return events.slice(0, -1);
    }
    return events;
  },

  hasMoreUpcomingEvents() {
    const instance = Template.instance();
    const count = instance.upcomingEvents.get()?.count() || 0;
    return count > (instance.state.get("upcomingEventLimit") || 0);
  },

  pastEvents() {
    const instance = Template.instance();
    const events = instance.pastEvents.get()?.fetch() || [];

    if (events.length > (instance.state.get("pastEventLimit") || 0)) {
      // The last event is to check if there are any more.
      return events.slice(0, -1);
    }
    return events;
  },

  hasMorePastEvents() {
    const instance = Template.instance();
    const count = instance.pastEvents.get()?.count() || 0;
    return count > (instance.state.get("pastEventLimit") || 0);
  },

  deleteConfirmDialogAttr(): DeleteConfirmDialogProps {
    const instance = Template.instance();
    return {
      confirmText: i18n(
        "venue.reallydelete",
        "Please confirm that you would like to delete this venue. This cannot be undone.",
      ),
      confirmButton: i18n("venue.detail.remove", "Remove this venue"),
      busyButton: i18n("venue.detail.remove.busy", "Deleting venue…"),
      onCancel: async () => {
        instance.state.set("verifyDelete", false);
      },
      onRemove: async () => {
        const { venue } = instance.data;
        instance.busy("deleting");
        try {
          await VenuesMethods.remove(venue._id);

          Alert.success(i18n("venue.removed", 'Removed venue "{NAME}".', { NAME: venue.name }));
          Router.go("profile");
        } catch (err) {
          Alert.serverError(err, i18n("venue.removed.error", "Deleting the venue went wrong"));
        } finally {
          instance.busy(false);
        }
      },
    };
  },

  venueEditAttr() {
    const instance = Template.instance();
    return {
      data: instance.data.venue,
      onSaved: () => {
        instance.state.set("editing", false);
      },
      onCanceled: () => {
        instance.state.set("editing", false);
      },
    };
  },
});

template.events({
  "click .js-venue-edit"(_event, instance) {
    instance.state.set("editing", true);
    instance.state.set("verifyDelete", false);
  },

  "click .js-venue-delete"(_event, instance) {
    instance.state.set("verifyDelete", true);
  },

  "click .js-show-more-upcoming-events"(_event, instance) {
    const limit = instance.state.get("upcomingEventLimit") || 0;
    instance.state.set("upcomingEventLimit", limit + EventLoadingBlockSize);
  },

  "click .js-show-more-past-events"(_event, instance) {
    const limit = instance.state.get("pastEventLimit") || 0;
    instance.state.set("pastEventLimit", limit + EventLoadingBlockSize);
  },
});
