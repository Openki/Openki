import $ from 'jquery';
import { Match, check } from 'meteor/check';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';

export const Analytics = {};

/** @type {false | JQuery.jqXHR<any>} */
let loading;

let tracker;

const SettingsPattern = Match.ObjectIncluding({
	url: String,
	site: Match.Integer,
});

const MatomoPattern = Match.ObjectIncluding({
	getTracker: Match.Where((f) => typeof f === 'function'),
});

/**
 * Returns true if matomo analytics settings are configured.
 */
Analytics.isConfigured = function () {
	return Match.test(Meteor.settings.public.matomo, SettingsPattern);
};

/**
 * Returns true if the tracker exists.
 */
Analytics.hasTracker = function () {
	return Boolean(tracker);
};

/**
 * Returns a promise resolving to the global Matomo object.
 */
Analytics.load = function () {
	let result;

	// Piwik/Matomo entry point is the global window.Piwik object. That one
	// is aliased to window.AnalyticsTracker. In order to prevent breakage
	// after the forthcomming Piwik->Matomo name change, we just rely on
	// the alias.
	if (Match.test(window.AnalyticsTracker, MatomoPattern)) {
		result = Promise.resolve(window.AnalyticsTracker);
	} else {
		result = new Promise((resolve, reject) => {
			check(Meteor.settings.public.matomo, SettingsPattern);
			const config = Meteor.settings.public.matomo;

			if (!loading) {
				// Use $.ajax with cache instead of $.loadScript().
				loading = $.ajax({
					url: `${config.url}${config.jsPath || 'js/'}`,
					cache: true,
					dataType: 'script',
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

	return result;
};

/**
 * Returns a promise resolving to the configured matomo tracker object.
 */
Analytics.tracker = function () {
	return Analytics.load().then((matomo) => {
		check(Meteor.settings.public.matomo, SettingsPattern);
		if (!tracker) {
			const config = Meteor.settings.public.matomo;
			tracker = matomo.getTracker(`${config.url}${config.phpPath || 'js/'}`, config.site);
		}
		return tracker;
	});
};

/**
 * Invokes the callback with the matomo tracker object.
 *
 * Only runs the callback if analytics is configured for this site.
 *
 * Example:
 *     Analytics.trytrack((tracker) => tracker.trackPageView());
 */
Analytics.trytrack = function (callback) {
	if (Analytics.isConfigured()) {
		Analytics.tracker().then(callback, (err) => {
			Meteor._debug('Exception when gathering analytics data', err);
		});
	}
};
/**
 * Track a event in matomo or log to console.
 * @param {string} category
 * @param {string} action
 * @param {string} [name]
 * @param {number} [value]
 */
Analytics.trackEvent = function (category, action, name, value) {
	if (Analytics.isConfigured()) {
		Analytics.trytrack((t) => {
			t.trackEvent(category, action, name, value);
		});
	} else {
		// For debugging
		// eslint-disable-next-line no-console
		console.info(
			`Analytics.Event: {category: ${category}, action: ${action}${name ? `, name: ${name}` : ''}${
				value ? `, value: ${value}` : ''
			}}`,
		);
	}
};

/**
 * Installs action-hooks on the router.
 */
Analytics.installRouterActions = function (router) {
	let started;

	router.onBeforeAction(function () {
		if (Analytics.hasTracker()) {
			Analytics.trytrack((t) => t.deleteCustomVariables());
			started = new Date();
		}
		this.next();
	});

	router.onAfterAction(() => {
		// Router.onAfterAction sometimes fires more than once on each page run.
		// https://github.com/iron-meteor/iron-router/issues/1031
		if (Tracker.currentComputation.firstRun) {
			Analytics.trytrack((t) => {
				if (started) {
					t.setGenerationTimeMs(new Date() - started);
					started = null;
				}
				t.enableLinkTracking();
				t.setDocumentTitle(document.title);
				t.setCustomUrl(window.location.href);
				t.trackPageView();
			});
		}
	});
};

export default Analytics;
