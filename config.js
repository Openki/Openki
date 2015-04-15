/**********************************************
*  With this file you can configure the app   *
***********************************************/

if (Meteor.isServer) {
Meteor.startup(function () {

// you probably want to have the Categories loaded
	createCategoriesIfNone();	   // category.rawdata.js


/***** TESTING *****/

// In order to test scalebility (Courses get multiplied by)
ScaleFaktor = 1;

// Uncomment the following lines if you want to have testdata loaded 
// by the script in server/testing.createnload.data.js 
// (there are probably some dependencies) -> FIXME

	createGroupsIfNone();          // Groups     from server/data/testing.groups.js
	createTestRegionsIfNone();     // Regions    from server/data/testing.regions.js  
	createCoursesIfNone();         // Courses    from server/data/testing.courses.js
	createLocationsIfNone();       // Locations  from server/data/testing.locations.js
	createEventsIfNone();          // Events     in   server/testing.createnload.data.js (generic) 
	loadTestEvents();              // Events     from server/data/testing.events.js


/////////////  upcomming:  ///////////////
// loadTestComments();          FIXME/TODO
// loadTemporaryEvent-Setting(Region=Zurich);  FIXME/TODO
//
// enable to show testing environment and prototype-messages
// TEST-ENV=1                   FIXME/TODO
//
// load critical-content-courses
// Critical=1                   FIXME/TODO
//
// enable social login buttons  FIXME/TODO
// Github                       FIXME/TODO
// Facebook                     FIXME/TODO
//////////////////////////////////////////


})}


this.AdminConfig = {
	name: 'Опеньки',
	adminEmails: ['greg@openki.example'],
	collections: {
		Courses: {}
	}
};
