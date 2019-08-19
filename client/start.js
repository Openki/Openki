import '/imports/startup/both';
import '/imports/startup/client';

import Alert from '/imports/api/alerts/alert';
import Languages from '/imports/api/languages/languages';

import Introduction from '/imports/ui/lib/introduction';
import UpdateViewport from '/imports/ui/lib/update-viewport';

import RegionSelection from '/imports/utils/region-selection';
import UrlTools from '/imports/utils/url-tools';

import 'bootstrap-sass';

// //////////// db-subscriptions:

Meteor.subscribe('version');

// Always load english translation
// For dynamically constructed translation strings there is no default
// translation and meteor would show the translation key if there is no
// translation in the current locale
mfPkg.loadLangs('en');


// close any verification dialogs still open
Router.onBeforeAction(function () {
	Tooltips.hide();

	Session.set('verify', false);

	this.next();
});

// Try to guess a sensible language
Meteor.startup(() => {
	const useLocale = function (lang) {
		if (!lang) {
			return false;
		}

		let locale = false;
		if (Languages[lang]) {
			locale = lang;
		}
		if (!locale && lang.length > 2) {
			const short = lang.substring(0, 2);
			if (Languages[short]) {
				locale = short;
			}
		}
		if (locale) {
			Session.set('locale', locale);
			return true;
		}
		return false;
	};

	// Check query parameter and cookies
	if (useLocale(UrlTools.queryParam('lg'))) {
		return;
	}
	if (useLocale(localStorage.getItem('locale'))) {
		return;
	}

	// Try to access the preferred languages. For the legacy browsers that don't
	// expose it we could ask the server for the Accept-Language headers but I'm
	// too lazy to implement this. It would become obsolete anyway.
	for (const language of navigator.languages || []) {
		if (useLocale(language)) return;
	}

	// Here we ask for the browser UI language which may not be what the visitor
	// wanted. Oh well.
	if (useLocale(navigator.language)) {
		return;
	}

	// Give up. Here's to Cultural Homogenization.
	useLocale('en');
});

Meteor.startup(() => {
	Tracker.autorun(() => {
		const desiredLocale = Session.get('locale');

		mfPkg.setLocale(desiredLocale);

		// Logic taken from mfpkg:core to get text directionality
		const lang = desiredLocale.substr(0, 2);
		const textDirectionality = msgfmt.dirFromLang(lang);
		Session.set('textDirectionality', textDirectionality);

		// Msgfmt already sets the dir attribute, but we want a class too.
		const isRTL = textDirectionality === 'rtl';
		$('body').toggleClass('rtl', isRTL);

		// Tell moment to switch the locale
		// Also change timeLocale which will invalidate the parts that depend on it
		const setLocale = moment.locale(desiredLocale);
		Session.set('timeLocale', setLocale);
		if (desiredLocale !== setLocale) {
			/* eslint-disable-next-line no-console */
			console.log(`Date formatting set to ${setLocale} because ${desiredLocale} not available`);
		}

		// HACK replace the datepicker locale settings
		// I do not understand why setting language: moment.locale() does not
		// work for the datepicker. But we want to use the momentjs settings
		// anyway, so we might as well clobber the 'en' locale.
		const mf = moment().localeData();

		const monthsShort = function () {
			if (typeof mf.monthsShort === 'function') {
				return _.map(_.range(12), month => mf.monthsShort(moment().month(month), ''));
			}
			return mf._monthsShort;
		};

		$.fn.datepicker.dates.en = _.extend({}, $.fn.datepicker.dates.en, {
			days: mf._weekdays,
			daysShort: mf._weekdaysShort,
			daysMin: mf._weekdaysMin,
			months: mf._months || mf._monthsNominativeEl,
			monthsShort: monthsShort(),
			weekStart: mf._week.dow,
		});
	});
});

Meteor.startup(RegionSelection.init);
Meteor.startup(Introduction.init);

Meteor.startup(UpdateViewport);

Accounts.onLogin(() => {
	const user = Meteor.user();

	const locale = user.profile.locale;
	if (locale) {
		Session.set('locale', locale);
	}
});

Accounts.onEmailVerificationLink((token) => {
	Router.go('profile');
	Accounts.verifyEmail(token, (error) => {
		if (error) {
			Alert.serverError(error, 'Address could not be verified');
		} else {
			Alert.success(mf(
				'email.verified',
				'Your e-mail has been verified.',
			));
		}
	});
});

minuteTime = new ReactiveVar();

// Set up reactive date sources that can be used for updates based on time
function setTimes() {
	const now = new Date();

	now.setSeconds(0);
	now.setMilliseconds(0);
	const old = minuteTime.get();
	if (!old || old.getTime() !== now.getTime()) {
		minuteTime.set(now);
	}
}
setTimes();

// Update interval of five seconds is okay
Meteor.setInterval(setTimes, 1000 * 5);
