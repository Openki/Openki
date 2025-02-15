import React, { useEffect } from "react";
import { Session } from "meteor/session";
import moment from "moment";
import { useTranslation } from "react-i18next";

import { Regions } from "/imports/api/regions/regions";
import { FindFilter } from "/imports/api/events/events";
import {  Groups } from "/imports/api/groups/groups";
import { Venues } from "/imports/api/venues/venues";

import { PublicSettings } from "/imports/utils/PublicSettings";
import * as Metatags from "/imports/utils/metatags";

import "./styles.scss";
import { useFindFilter } from "/imports/api/groups/publications";
import { EventEntity, EventModel } from "/imports/api/events/events";
import { useSession } from "/imports/utils/react-meteor-data";
import { useCurrentRegion } from "/imports/utils/useCurrentRegion";
import { List } from "./list";
import { Router } from "meteor/iron:router";
import { useSiteName } from "/imports/utils/getSiteName";


export function KioskEventsPage({today, future, ongoing, filter}:{  today: Mongo.Cursor<EventEntity, EventModel>,
  future: Mongo.Cursor<EventEntity, EventModel>,
  ongoing: Mongo.Cursor<EventEntity, EventModel>,
  filter: FindFilter}){
  const { t } = useTranslation();

const [isLoading, group] = useFindFilter({ _id: filter.group });

const currentRegion = useCurrentRegion();

const siteName = useSiteName()

  function groupLogo() {

    if (group) {
      return group.publicLogoUrl();
    }
    return "";
  }
  function groupName() {
 
    if (group) {
      return group.name;
    }
    return "";
  }
  function venueName(venueId: string) {
    const instance = Template.instance();
    instance.subscribe("venueDetails", venueId);

    const venue = Venues.findOne({ _id: venueId });
    if (venue) {
      return venue.name;
    }
    return "";
  }
  function showTime() {
    useSession("seconds");
    return moment().format("LTS");
  }
  function showDate() {
    useSession("seconds");
    return moment().format("LL");
  }

  function headerLogo() {
    let headerLogo;

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
  }

 function headerAlt() {
    if (currentRegion?.custom?.headerLogoKiosk?.alt) {
      return currentRegion.custom.headerLogoKiosk.alt;
    }

    return PublicSettings.headerLogoKiosk.alt;
  }

useEffect(()=>{
  Metatags.setCommonTags(t("event.list.windowtitle", "Events"));

})

  return  <div className="kiosk container-fluid">
  <div className="page-component">
    <div className="kiosk-heading">
      {{#if filter.group}}
        <a href={Router.path('groupDetails', {_id=filter.group}}>
          {{#if groupLogo (filter.group)}}
            <img className="kiosk-logo kiosk-logo-group" src={groupLogo (filter.group)} />
          {{/if}}
          {groupName (filter.group)}
        </a>
      {{else}}
        {{#if filter.venue}}
          <a href={Router.path('venueDetails', {_id=filter.venue})}>{venueName (filter.venue)}</a>
        {{else}}
          <a href={Router.path('home')}>
            {{#if headerLogo()}}
              <img src={headerLogo()} alt={headerAlt()} className="kiosk-logo kiosk-logo-brand"/>
            {{/if}}
            {siteName}
          </a>
        {{/if}}
      {{/if}}
    </div>
    <div className="kiosk-language-selection">
      <LanguageSelectionWrap />
    </div>
    <div className="kiosk-moment">
      <span className="kiosk-moment-time">{showTime()}</span>
      <span className="kiosk-moment-date">{showDate()}</span>
    </div>
  </div>
  {{#if ongoing.count()}}
    <div className="page-component">
      <h3>{t('kiosk.ongoing' ,'{NUM, plural, one{One ongoing event:} other{# ongoing events:} }',{ NUM:ongoing.count()})}
      </h3>
      <List events={ongoing.fetch()} timePeriod="ongoing"/>
    </div>
  {{/if}}

  {{#if today.count()}}
    <div className="page-component page-component-seperated">
      <h3>{t('kiosk.today' ,'{NUM, plural, one{One event} other{# events} } later today:', {NUM:today.count()})}
      </h3>
      <List events={today.fetch()} timePeriod="today"/>
    </div>
  {{/if}}

  {{#if future.count()}}
    <div className="page-component page-component-seperated">
      <h3>{t('kiosk.future' ,'Future events:', {NUM:future.count()})}</h3>
      <List events={future.fetch()} timePeriod="upcoming"/>
    </div>
  {{else}}
    <h3>{t('kiosk.noFutureEvents', 'There are no future events')}</h3>
  {{/if}}
</div>
}
