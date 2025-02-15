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
