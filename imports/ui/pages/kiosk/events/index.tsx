import React from "react";
import { Session } from "meteor/session";
import moment from "moment";

import { Regions } from "/imports/api/regions/regions";
import { Groups } from "/imports/api/groups/groups";
import { Venues } from "/imports/api/venues/venues";

import { PublicSettings } from "/imports/utils/PublicSettings";
import { i18n } from "/imports/startup/both/i18next";
import * as Metatags from "/imports/utils/metatags";

import "./styles.scss";

const Template = TemplateAny as TemplateStaticTyped<"kioskEventsPage">;

const template = Template.kioskEventsPage;

template.onCreated(function () {
  const instance = this;

  instance.autorun(() => {
    Metatags.setCommonTags(i18n("event.list.windowtitle", "Events"));
  });
});

template.helpers({
  groupLogo(groupId: string) {
    const instance = Template.instance();
    instance.subscribe("group", groupId);

    const group = Groups.findOne({ _id: groupId });
    if (group) {
      return group.publicLogoUrl();
    }
    return "";
  },
  groupName(groupId: string) {
    const instance = Template.instance();
    instance.subscribe("group", groupId);

    const group = Groups.findOne({ _id: groupId });
    if (group) {
      return group.name;
    }
    return "";
  },
  venueName(venueId: string) {
    const instance = Template.instance();
    instance.subscribe("venueDetails", venueId);

    const venue = Venues.findOne({ _id: venueId });
    if (venue) {
      return venue.name;
    }
    return "";
  },
  showTime() {
    Session.get("seconds");
    return moment().format("LTS");
  },
  showDate() {
    Session.get("seconds");
    return moment().format("LL");
  },

  headerLogo() {
    let headerLogo;

    const currentRegion = Regions.currentRegion();
    if (currentRegion?.custom?.headerLogoKiosk?.src) {
      // the region has a custom logo
      headerLogo = currentRegion.custom.headerLogoKiosk.src;
    } else {
      // general logo
      headerLogo = PublicSettings.headerLogoKiosk.src;
    }

    if (!headerLogo) {
      return "";
    }

    if (headerLogo.startsWith("data:image/")) {
      // base64 image
      return headerLogo;
    }

    if (headerLogo.startsWith(PublicSettings.s3.publicUrlBase)) {
      // in our s3 file storage
      return headerLogo;
    }

    // in the openki repository folder "public/logo/"
    return `/logo/${headerLogo}`;
  },

  headerAlt() {
    const currentRegion = Regions.currentRegion();
    if (currentRegion?.custom?.headerLogoKiosk?.alt) {
      return currentRegion.custom.headerLogoKiosk.alt;
    }

    return PublicSettings.headerLogoKiosk.alt;
  },
});


export function KioskEventsPage(){
  return  <div class="kiosk container-fluid">
  <div class="page-component">
    <div class="kiosk-heading">
      {{#if filter.group}}
        <a href="{{pathFor 'groupDetails' _id=filter.group}}">
          {{#if groupLogo filter.group}}
            <img class="kiosk-logo kiosk-logo-group" src="{{groupLogo filter.group}}" />
          {{/if}}
          {{groupName filter.group}}
        </a>
      {{else}}
        {{#if filter.venue}}
          <a href="{{pathFor 'venueDetails' _id=filter.venue}}">{{venueName filter.venue}}</a>
        {{else}}
          <a href="{{pathFor 'home'}}">
            {{#if headerLogo}}
              <img src="{{headerLogo}}" alt="{{headerAlt}}" class="kiosk-logo kiosk-logo-brand">
            {{/if}}
            {{siteName}}
          </a>
        {{/if}}
      {{/if}}
    </div>
    <div class="kiosk-language-selection">
      {{> languageSelectionWrap}}
    </div>
    <div class="kiosk-moment">
      <span class="kiosk-moment-time">{{showTime}}</span>
      <span class="kiosk-moment-date">{{showDate}}</span>
    </div>
  </div>
  {{#if ongoing.count}}
    <div class="page-component">
      <h3>{{i18n 'kiosk.ongoing' '{NUM, plural, one{One ongoing event:} other{# ongoing events:} }' NUM=ongoing.count}}
      </h3>
      {{> kioskEventList events=ongoing timePeriod="ongoing"}}
    </div>
  {{/if}}

  {{#if today.count}}
    <div class="page-component page-component-seperated">
      <h3>{{i18n 'kiosk.today' '{NUM, plural, one{One event} other{# events} } later today:' NUM=today.count}}
      </h3>
      {{> kioskEventList events=today timePeriod="today"}}
    </div>
  {{/if}}

  {{#if future.count}}
    <div class="page-component page-component-seperated">
      <h3>{{i18n 'kiosk.future' 'Future events:' NUM=future.count}}</h3>
      {{> kioskEventList events=future timePeriod="upcoming"}}
    </div>
  {{else}}
    <h3>{{i18n 'kiosk.noFutureEvents' 'There are no future events'}}</h3>
  {{/if}}
</div>
}
