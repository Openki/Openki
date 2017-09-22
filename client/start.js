import "/imports/startup/client/clientError.js";
import "/imports/RegionSelection.js";

////////////// db-subscriptions:

Meteor.subscribe('version');

// Always load english translation
// For dynamically constructed translation strings there is no default
// translation and meteor would show the translation key if there is no
// translation in the current locale
mfPkg.loadLangs('en');


// close any verification dialogs still open
Router.onBeforeAction(function() {
	Tooltips.hide();

	Session.set('verify', false);

	this.next();
});

// We keep two subscription caches around. One is for the regular subscriptions like list of courses,
// the other (miniSubs) is for the name lookups we do all over the place.
subs = new SubsCache({ cacheLimit: 5, expireAfter: 1 });
miniSubs = new SubsCache({ cacheLimit: 50, expireAfter: 1 });


// Try to guess a sensible language
Meteor.startup(function() {
	var useLocale = function(lang) {
		if (!lang) return false;

		var locale = false;
		if (Languages[lang]) {
			locale = lang;
		}
		if (!locale && lang.length > 2) {
			var short = lang.substring(0, 2);
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
	if (useLocale(UrlTools.queryParam('lg'))) return;
	if (useLocale(localStorage.getItem('locale'))) return;

	// Try to access the preferred languages. For the legacy browsers that don't
	// expose it we could ask the server for the Accept-Language headers but I'm
	// too lazy to implement this. It would become obsolete anyway.
	for (var i in navigator.languages || []) {
		if (useLocale(navigator.languages[i])) return;
	}

	// Here we ask for the browser UI language which may not be what the visitor
	// wanted. Oh well.
	if (useLocale(navigator.language)) return;

	// Give up. Here's to Cultural Homogenization.
	useLocale('en');
});

Meteor.startup(function() {
	Tracker.autorun(function() {
		var desiredLocale = Session.get('locale');

		mfPkg.setLocale(desiredLocale);

		// Logic taken from mfpkg:core to get text directionality
		var lang = desiredLocale.substr(0, 2);
		var textDirectionality = msgfmt.dirFromLang(lang);
		Session.set('textDirectionality', textDirectionality);

		// Msgfmt already sets the dir attribute, but we want a class too.
		var isRTL = textDirectionality == 'rtl';
		$('body').toggleClass('rtl', isRTL);

		// Tell moment to switch the locale
		// Also change timeLocale which will invalidate the parts that depend on it
		var setLocale = moment.locale(desiredLocale);
		Session.set('timeLocale', setLocale);
		if (desiredLocale !== setLocale) console.log("Date formatting set to "+setLocale+" because "+desiredLocale+" not available");

		// HACK replace the datepicker locale settings
		// I do not understand why setting language: moment.locale() does not
		// work for the datepicker. But we want to use the momentjs settings
		// anyway, so we might as well clobber the 'en' locale.
		var mf = moment().localeData();

		var monthsShort = function() {
			if (typeof mf.monthsShort === 'function') {
				return _.map(_.range(12), function(month) { return mf.monthsShort(moment().month(month), ''); });
			}
			return mf._monthsShort;
		};

		$.fn.datepicker.dates.en = _.extend({}, $.fn.datepicker.dates.en, {
			days: mf._weekdays,
			daysShort: mf._weekdaysShort,
			daysMin: mf._weekdaysMin,
			months: mf._months || mf._monthsNominativeEl,
			monthsShort: monthsShort(),
			weekStart: mf._week.dow
		});
	});
});

Meteor.startup(RegionSelection.init);
Meteor.startup(Assistant.init);

Meteor.startup(getViewportWidth);

Accounts.onLogin(function() {
	var user = Meteor.user();

	var locale = user.profile.locale;
	if (locale) Session.set('locale', locale);
});

Accounts.onEmailVerificationLink(function(token, done) {
	Router.go('profile');
	Accounts.verifyEmail(token, function(error) {
		if (error) {
			showServerError('Address could not be verified', error);
		} else {
			addMessage(mf("email.verified", "Email verified."), 'success');
		}
	});
});

minuteTime = new ReactiveVar();

// Set up reactive date sources that can be used for updates based on time
function setTimes() {
	var now = new Date();

	now.setSeconds(0);
	now.setMilliseconds(0);
	var old = minuteTime.get();
	if (!old || old.getTime() !== now.getTime()) {
		minuteTime.set(now);
	}
}
setTimes();

// Update interval of five seconds is okay
Meteor.setInterval(setTimes, 1000*5);
