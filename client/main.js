

////////////// db-subscriptions:

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
	};

	if (useRegion(localStorage.getItem("region"))) return;

	Meteor.call('autoSelectRegion', function(error, regionId) {
		if (useRegion(regionId)) return;

		// Give up
		useRegion('all');
	});
});


// We keep two subscription manager around. One is for the regular subscriptions like list of courses,
// the other (miniSubs) is for the name lookups we do all over the place.
subs = new SubsManager({ cacheLimit: 5, expireIn: 5 });
miniSubs = new SubsManager({ cacheLimit: 150, expireIn: 1 });


// Try to guess a sensible language
Meteor.startup(function() {
	var useLocale = function(lang) {
		if (!lang) return false;

		var locale = false;
		if (lgs[lang]) {
			locale = lang;
		}
		if (!locale && lang.length > 2) {
			var short = langCandidate.substring(0, 2);
			if (lgs[short]) {
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
	var acceptLangs = Array.prototype.slice.call(navigator.languages);
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
	Deps.autorun(function() {
		var desiredLocale = Session.get('locale');
		
		mfPkg.setLocale(desiredLocale);

		  // Tell moment to switch the locale
		// Also change timeLocale which will invalidate the parts that depend on it
		var setLocale = moment.locale(desiredLocale);
		Session.set('timeLocale', setLocale);
		if (desiredLocale !== setLocale) console.log("Date formatting set to "+setLocale+" because "+desiredLocale+" not available");
	});
});

Meteor.startup(Assistant.init);

Accounts.onLogin(function() {
	var locale = Meteor.user().profile.locale;
	if (locale) Session.set('locale', locale);
});

Template.ticker.helpers({
	marquee: function() {
		return Meteor.settings && Meteor.settings.public && Meteor.settings.public.marquee;
	}
});

Accounts.onEmailVerificationLink(function(token, done) {
	Accounts.verifyEmail(token, function(error) {
		if (error) {
			addMessage(mf("email.verificationFailed", "Address could not be verified"), 'danger');
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
