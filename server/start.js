Meteor.startup(function () {

	// initialize list of categories
	createCategoriesIfNone();

	if (Meteor.settings.testdata) {
		createGroupsIfNone();          // Groups     from server/data/testing.groups.js
		createTestRegionsIfNone();     // Regions    from server/data/testing.regions.js
		createCoursesIfNone(Meteor.settings.testdata);
		createLocationsIfNone();       // Locations  from server/data/testing.locations.js
		createEventsIfNone();          // Events     in   server/testing.createnload.data.js (generic)
		loadTestEvents();              // Events     from server/data/testing.events.js
	}
});
