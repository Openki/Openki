
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




