
////////////// loading-indicator
Meteor.startup(function () {
  Session.setDefault('coursesLoaded', false);
  var region = localStorage.getItem("region")
  if (!region) region = 'all';
  Session.set("region", region);
});


////////////// db-subscriptions:

Meteor.subscribe('categories');
Meteor.subscribe('comments');
Meteor.subscribe('discussions');
Meteor.subscribe('locations');
Meteor.subscribe('messages');
Meteor.subscribe('regions');
Meteor.subscribe('roles');
Meteor.subscribe('votings');
Meteor.subscribe('currentUser');

// close any verification dialogs still open
Router.onBeforeAction(function() {
	Session.set('verify', false);
	this.next();
});

// Use browser language for date formatting
Deps.autorun(function() {
	var desiredLocale = Session.get('locale');
	var setLocale = moment.locale(desiredLocale);
	Session.set('timeLocale', setLocale);
	if (desiredLocale !== setLocale) console.log("Date formatting set to "+setLocale+" because "+desiredLocale+" not available");
});

// Set up a reactive date sources that can be used for updates based on time
function setTimes() {
	var now = moment();
	Session.set('coarseTime', ''+moment().startOf('hour').toDate());
	Session.set('fineTime', ''+moment().startOf('minute').toDate());
}
setTimes();

// Update interval of five seconds is okay
Meteor.setInterval(setTimes, 1000*5);
