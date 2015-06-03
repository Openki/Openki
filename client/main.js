

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


Meteor.startup(function() {
	Session.set('locale', localStorage.getItem('locale'));

	Deps.autorun(function() {
		var desiredLocale = Session.get('locale');
		localStorage.setItem('locale', desiredLocale);
		
		// Tell moment to switch the locale
		// Also change timeLocale which will invalidate the parts that depend on it
		var setLocale = moment.locale(desiredLocale);
		Session.set('timeLocale', setLocale);
		if (desiredLocale !== setLocale) console.log("Date formatting set to "+setLocale+" because "+desiredLocale+" not available");
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
