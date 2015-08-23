

////////////// db-subscriptions:

Meteor.subscribe('locations');
Meteor.subscribe('roles');
Meteor.subscribe('currentUser');
Meteor.subscribe('files');

// close any verification dialogs still open
Router.onBeforeAction(function() {
	Session.set('verify', false);

	this.next();
});

// Subscribe to list of regions and configure the regions
// This checks client storage for a region setting. When there is no previously
// selected region, we ask the server to do geolocation. If that fails too,
// we just set it to 'all regions'.
regionSub = Meteor.subscribe('regions', function() {
	var useRegion = function(regionId) {
		if (regionId == 'all' || Regions.findOne({ _id: regionId })) {
			Session.set("region", regionId);
			return true;
		}
		return false;
	}

	if (useRegion(localStorage.getItem("region"))) return;

	Meteor.call('autoSelectRegion', function(error, regionId) {
		if (useRegion(regionId)) return;

		// Give up
		useRegion('all');
	});
});


// Try to guess a sensible language
Meteor.startup(function() {
	// Could be built dynamically I guess
	var availableLangs = {
		'ar': 'ar',
		'de': 'de',
		'en': 'en',
		'es': 'es',
		'fr': 'fr',
		'it': 'it',
		'zh': 'zh_TW'
	};

	var useLocale = function(lang) {
		var locale = false;
		if (availableLangs[lang]) {
			locale = availableLangs[lang];
		}
		if (!locale && lang.length > 2) {
			var short = langCandidate.substring(0, 2);
			if (availableLangs[short]) {
				locale = availableLangs[short];
			}
		}
		if (locale) {
			Session.set('locale', locale);
			return true;
		}
		return false;
	}

	// Soon everybody will support this, right?
	var desiredLangs = navigator.languages || [navigator.language];
	desiredLangs = Array.prototype.slice.call(desiredLangs);
	desiredLangs.unshift(localStorage.getItem('locale'));
	desiredLangs.push('en'); // fallback

	for (l in desiredLangs) {
		var langCandidate = desiredLangs[l];
		if (langCandidate && useLocale(langCandidate)) break;
	}
	
	Deps.autorun(function() {
		var desiredLocale = Session.get('locale');
		
		// Tell moment to switch the locale
		// Also change timeLocale which will invalidate the parts that depend on it
		var setLocale = moment.locale(desiredLocale);
		Session.set('timeLocale', setLocale);
		if (desiredLocale !== setLocale) console.log("Date formatting set to "+setLocale+" because "+desiredLocale+" not available");
	});
});

Accounts.onLogin(function() {
	var locale = Meteor.user().profile.locale;
	if (locale) Session.set('locale', locale);
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
