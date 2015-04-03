/**********************************************
*  With this file you can configure the app   *
***********************************************/

if (Meteor.isServer) {
Meteor.startup(function () {

// you probably want to have the Categories loaded
	createCategoriesIfNone();	   // category.rawdata.js


/***** TESTING *****/

// In order to test scalebility (Courses multiplicated)
ScaleFaktor = 1;

// Uncomment the following lines if you want to have testdata loaded 
// by the script in server/testing.createnload.data.js 
// (there are probably some dependencies) -> FIXME

	createTestRegionsIfNone();     // Regions    in server/data/testing.regions.rawdata.js  
	createCoursesIfNone();         // Courses    in server/data/testing.examplecourses.js
	createGroupsIfNone();          // Groups     in server/data/testing.groups.rawdata.js
	createLocationsIfNone();       // Locations  in server/data/testing.locations.rawdata.js
	loadTestEvents();        // Events     in server/data/testing.events.js
	createEventsIfNone();          // Events     (generic) in server/testing.createnload.data.js 


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
