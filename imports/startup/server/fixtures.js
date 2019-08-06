import '/imports/api/fixtures/methods';
import CourseDiscussions from '/imports/api/course-discussions/course-discussions';
import Courses from '/imports/api/courses/courses';
import Events from '/imports/api/events/events';
import Groups from '/imports/api/groups/groups';
import Regions from '/imports/api/regions/regions';
import Venues from '/imports/api/venues/venues';

if (Meteor.settings.testdata) {
	const logResult = function (error, result) {
		if (error) {
			throw error;
		}
		/* eslint-disable-next-line no-console */
		console.log(result);
	};

	const ifCollectionEmpty = function (collection, methods) {
		if (collection.find().count() === 0) {
			// eslint-disable-next-line no-restricted-syntax
			for (const method of methods) Meteor.call(method, logResult);
		}
	};

	Meteor.startup(() => {
		// Remove the rate-limiting to allow the tests repeated logins
		Accounts.removeDefaultRateLimit();

		ifCollectionEmpty(Regions, ['fixtures.regions.create']);
		ifCollectionEmpty(Groups, ['fixtures.groups.create']);
		ifCollectionEmpty(Venues, ['fixtures.venues.create']);
		ifCollectionEmpty(Courses, ['fixtures.courses.create']);
		ifCollectionEmpty(Events, ['fixtures.events.create', 'fixtures.events.generate']);
		ifCollectionEmpty(CourseDiscussions, ['fixtures.comments.generate']);
	});
}
