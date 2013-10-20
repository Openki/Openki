
// allgemeine praktische funktionen

Template.maincontent.route_is = function (data,options) {
// strube funktion, die irgendwas macht, aber es tut
// macht, dass das routing im template "maincontent" funtkioniert
    if ( Session.equals( 'page_id', data ) ) {
	return options.fn( this );
    }
    return options.inverse( this );
};

////////////// login stettings
Accounts.ui.config({
	passwordSignupFields: 'USERNAME_AND_OPTIONAL_EMAIL'
});

////////////// loading-indicator
Meteor.startup(function () {
  Session.setDefault('coursesLoaded', false);
});


////////////// db-subscriptions:

//Meteor.subscribe('courses', Session.get('region'))
Meteor.subscribe('categories');
Meteor.subscribe('comments');
Meteor.subscribe('courses', function onComplete() {
  Session.set('coursesLoaded', true);
});
Meteor.subscribe('discussions');
Meteor.subscribe('locations');
Meteor.subscribe('messages');
Meteor.subscribe('regions');
Meteor.subscribe('roles');
Meteor.subscribe('votings');
Meteor.subscribe('users');

Template.maincontent.loadcourse = function() {
	return Courses.findOne(Session.get('selected_course'))
}


