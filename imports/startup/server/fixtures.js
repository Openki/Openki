import Regions from '/imports/api/regions/regions.js';
import '/imports/api/fixtures/methods.js';
import Courses from '/imports/api/courses/courses.js';
import CourseDiscussions from '/imports/api/course-discussions/course-discussions.js';
import Groups from '/imports/api/groups/groups.js';
import Venues from '/imports/api/venues/venues.js';

if (Meteor.settings.testdata) {
	const logResult = function(error, result) {
		if (error) throw error;
		console.log(result);
	};

	const ifCollectionEmpty = function(collection, methods) {
		if (collection.find().count() === 0) {
			for (var method of methods) Meteor.call(method, logResult);
		}
	};

	Meteor.startup(function() {
		// Remove the rate-limiting to allow the tests repeated logins
		Accounts.removeDefaultRateLimit();

		ifCollectionEmpty(Regions, [ 'fixtures.regions.create' ]);
		ifCollectionEmpty(Groups,  [ 'fixtures.groups.create' ]);
		ifCollectionEmpty(Venues,  [ 'fixtures.venues.create' ]);
		ifCollectionEmpty(Courses, [ 'fixtures.courses.create' ]);
		ifCollectionEmpty(Events,  [ 'fixtures.events.create', 'fixtures.events.generate' ]);
		ifCollectionEmpty(CourseDiscussions, [ 'fixtures.comments.generate' ]);
	});
}
