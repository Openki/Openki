import $ from "jquery";
import { Match, check } from "meteor/check";
import { Meteor } from "meteor/meteor";
import { Tracker } from "meteor/tracker";
import { Router } from "meteor/iron:router";
import { Promise } from "meteor/promise";

import { PublicSettings } from "/imports/utils/PublicSettings";

let loading: false | JQuery.jqXHR<any>;

let _tracker: any;

const SettingsPattern = Match.ObjectIncluding({
  url: String,
  site: Match.Integer,
  jsPath: String,
  phpPath: String,
});

const MatomoPattern = Match.ObjectIncluding({
  getTracker: Match.Where((f) => typeof f === "function"),
});

/**
 * Returns true if matomo analytics settings are configured.
 */
export function isConfigured() {
  return Match.test(PublicSettings.matomo, SettingsPattern);
}

/**
 * Returns true if the tracker exists.
 */
export function hasTracker() {
  return !!_tracker;
}

/**
 * Returns a promise resolving to the global Matomo object.
 */
export function load(): Promise<any> {
  let result;

  // Piwik/Matomo entry point is the global window.Piwik object. That one
  // is aliased to window.AnalyticsTracker. In order to prevent breakage
  // after the forthcomming Piwik->Matomo name change, we just rely on
  // the alias.
  if (Match.test(window.AnalyticsTracker, MatomoPattern)) {
    result = Promise.resolve(window.AnalyticsTracker);
  } else {
    result = new Promise((resolve, reject) => {
      check(PublicSettings.matomo, SettingsPattern);
      const config = PublicSettings.matomo;

      if (!loading) {
        // Use $.ajax with cache instead of $.loadScript().
        loading = $.ajax({
          url: `${config.url}${config.jsPath}`,
          cache: true,
          dataType: "script",
        }).always(() => {
          loading = false;
        });
      }

      loading
        .done(() => {
          check(window.AnalyticsTracker, MatomoPattern);
          resolve(window.AnalyticsTracker);
        })
        .fail((_jqxhr, _settings, exception) => {
          reject(exception);
        });
    });
  }

  return result as any;
}

/**
 * Returns a promise resolving to the configured matomo tracker object.
 */
export async function tracker() {
  const matomo = await load();
  check(PublicSettings.matomo, SettingsPattern);
  if (!_tracker) {
    const config = PublicSettings.matomo;
    _tracker = matomo.getTracker(`${config.url}${config.phpPath}`, config.site);
  }
  return _tracker;
}

/**
 * Invokes the callback with the matomo tracker object.
 *
 * Only runs the callback if analytics is configured for this site.
 *
 * Example:
 *     Analytics.trytrack((tracker) => tracker.trackPageView());
 */
export function trytrack(callback: (t: any) => void) {
  if (isConfigured()) {
    tracker().then(callback, (err) => {
      Meteor._debug("Exception when gathering analytics data", err);
    });
  }
}
/**
 * Track a event in matomo or log to console.
 */
export function trackEvent(category: string, action: string, name?: string, value?: number) {
  if (isConfigured()) {
    trytrack((t) => {
      t.trackEvent(category, action, name, value);
    });
  } else {
    // For debugging
    console.debug(
      `Analytics.Event: {category: ${category}, action: ${action}${name ? `, name: ${name}` : ""}${
        value ? `, value: ${value}` : ""
      }}`,
    );
  }
}

/**
 * Installs action-hooks on the router.
 */
export function installRouterActions() {
  let started: Date | null;

  Router.onBeforeAction(function (this) {
    if (hasTracker()) {
      trytrack((t) => t.deleteCustomVariables());
      started = new Date();
    }
    this.next();
  });

  Router.onAfterAction(() => {
    // Router.onAfterAction sometimes fires more than once on each page run.
    // https://github.com/iron-meteor/iron-router/issues/1031
    if (Tracker.currentComputation?.firstRun) {
      trytrack((t) => {
        if (started) {
          t.setPagePerformanceTiming(
            undefined,
            undefined,
            undefined,
            undefined,
            Date.now() - started.getTime() /** domCompletionTimeInMS */,
          );
          started = null;
        }
        t.enableLinkTracking();
        t.setDocumentTitle(document.title);
        t.setCustomUrl(window.location.href);
        t.trackPageView();
      });
    }
  });
}
