

////////////// db-subscriptions:

var regionSub = Meteor.subscribe('regions');
Meteor.subscribe('locations');
Meteor.subscribe('roles');
Meteor.subscribe('currentUser');
Meteor.subscribe('files');
// close any verification dialogs still open
Router.onBeforeAction(function() {
	Session.set('verify', false);

	this.next();
});

/*  TODO: QUESTION: redundant with autoRegionSelect?
// Choose default region when none is set
Deps.autorun(function() {
	if (regionSub.ready()) {
		var region = localStorage.getItem("region");
		if (!region || region == 'all') {
			if (Regions.find({}).count() == 1) {
				region = Regions.findOne({})._id;
			} else {
				region = 'all';
			}
		}
		Session.set("region", region);
	}
});
*/

Meteor.startup(function() {
	Session.set('locale', localStorage.getItem('locale'));

	Deps.autorun(function() {
		var desiredLocale = Session.get('locale');
		localStorage.setItem('locale', desiredLocale);
		
		// Tell moment to switch the locale
		// Also change timeLocale which will invalidate the parts that depends on it
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
