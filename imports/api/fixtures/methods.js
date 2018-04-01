import Courses from '/imports/api/courses/courses.js';
import CourseDiscussions from '/imports/api/course-discussions/course-discussions.js';
import Events from '/imports/api/events/events.js';
import ensure from "./ensureFixture.js";
import "./Prng.js";
import Groups from '/imports/api/groups/groups.js';
import Regions from '/imports/api/regions/regions.js';
import Venues from '/imports/api/venues/venues.js';

import StringTools from '/imports/utils/string-tools.js';
import HtmlTools from '/imports/utils/html-tools.js';

import seedrandom from 'seedrandom';
const Prng = function(staticseed) {
	return seedrandom(Meteor.settings.prng === "static" ? staticseed : undefined);
};

// Make a number that looks like a human chose it, favouring 2 and 5
const humandistrib = function(prng) {
	var factors = [0,0,1,2,2,3,5,5];
	return factors[Math.floor(Math.random()*factors.length)] * (prng() > 0.7 ? humandistrib(prng) : 1) + (prng() > 0.5 ? humandistrib(prng) : 0);
};

// Select a date that is after the given date
// For past dates a date between the original date and the present is chosen,
// dates closer to the original date preferred.
// For future dates, a date between the original date and double the time between now and then is chosen.
const sometimesAfter = function(date) {
	var prng = Prng("sometimesAfter");

	// Seconds between then and now
	var spread = new Date(Math.abs(new Date().getTime() - date.getTime()));

	// Quadratic dropoff: Place new date closer to the original date statistically
	var placement = prng();
	var squaredPlacement = placement * placement;

	return new Date(date.getTime() + spread * squaredPlacement);
};


// Unfortunately we can't make this a debugOnly package because the integration
// tests use the data too, and they run with the --production flag.
// This guard is here until we find a better solution.
if (Meteor.settings.testdata) {
	const regionsCreate = function() {
		var regions = require("./data/region.fixtures.js").default;

		for (var r of regions) {
			const region = Object.assign({}, r); // clone
			if (region.loc) {
				var coordinates = region.loc.reverse(); // GeoJSON takes latitude first
				region.loc = { 'type': 'Point', 'coordinates': coordinates };
			}
			Regions.insert(region);
		}

		return "Inserted " + regions.length + " region fixtures.";
	};

	const groupsCreate = function() {
		var groups = require("./data/group.fixtures.js").default;

		for (var g of groups) {
			const group = Object.assign({}, g);
			group.createdby = 'ServerScript_loadingTestgroups';

			// Always use same id for same group to avoid broken urls while testing
			group._id = ensure.fixedId([ group.name, group.description ]);
			group.members = _.map(group.members, function(name) {
				return ensure.user(name)._id;
			});
			Groups.insert(group);
		}

		return "Inserted " + groups.length + " group fixtures.";
	};

	eventsCreate = function() {
		var events = require("./data/event.fixtures.js").default;

		// These events are most useful if they show up in the calendar for the
		// current week, so we move them from their original day into this
		// week but keep the weekday.
		var dateOffset = 0;

		for (var e of events) {
			const event = Object.assign({}, e);
			if (Events.findOne({ _id: event._id })) continue; // Don't create events that exist already
			event.createdBy = ensure.user(event.createdby)._id;
			event.groups = _.map(event.groups, ensure.group);
			event.groupOrganizers = [];

			// We place the first event in the series on the monday of this week
			// and all later events relative to it.
			if (dateOffset === 0) {
				var weekstart = new Date();
				weekstart.setHours(0);
				weekstart.setMinutes(0);
				weekstart.setSeconds(0);
				weekstart.setDate(weekstart.getDate() - weekstart.getDay() + 1);

				var dayOfFirstEvent = new Date(event.start.$date);
				dayOfFirstEvent.setHours(0);
				dayOfFirstEvent.setMinutes(0);
				dayOfFirstEvent.setSeconds(0);
				dateOffset = weekstart.getTime() - dayOfFirstEvent.getTime();
			}

			event.venue = ensure.venue(event.venue, event.region);
			event.internal = !!event.internal;


			var regionZone = LocalTime.zone(event.region);

			event.startLocal = LocalTime.toString(new Date(event.start.$date + dateOffset));
			event.start = regionZone.fromString(event.startLocal).toDate();
			event.endLocal = new Date(event.end.$date + dateOffset);
			event.end = regionZone.fromString(event.endLocal).toDate();
			event.time_created = new Date(event.time_created.$date);
			event.time_lastedit = new Date(event.time_lastedit.$date);
			Events.insert(event);
		}

		return "Inserted " + events.length + " event fixtures.";
	};

	const venuesCreate = function() {
		var venues = require("./data/venue.fixtures.js").default;

		var prng = Prng("loadLocations");

		var testRegions = [
			Regions.findOne('9JyFCoKWkxnf8LWPh'),
			Regions.findOne('EZqQLGL4PtFCxCNrp')
		];

		for (var v of venues) {
			const venueData = Object.assign({}, v);
			venueData.region = prng() > 0.85 ? testRegions[0] : testRegions[1];

			var venue = ensure.venue(venueData.name, venueData.region._id);

			_.extend(venue, venueData);

			venue.createdby = ensure.user(venue.createdby)._id;

			Venues.update(venue._id, venue);
		}

		return "Inserted " + venues.length + " venue fixtures.";
	};

	const coursesCreate = function() {
		var courses = require("./data/course.fixtures.js").default;

		var prng = Prng("createCourses");

		for (var c of courses) {
			const course = Object.assign({}, c);
			for (var member of course.members) {
				member.user = ensure.user(member.user)._id;
			}

			course.createdby = ensure.user(course.createdby)._id;

			course.slug = StringTools.slug(course.name);
			course.internal = !!course.internal;

			course._id = ensure.fixedId([ course.name, course.description ]);

			course.date = prng() > 0.50 ? new Date(new Date().getTime() + ((prng() - 0.25) * 8000000000)) : false;
			var age = Math.floor(prng() * 80000000000);
			course.time_created = new Date(new Date().getTime() - age);
			course.time_lastedit = new Date(new Date().getTime() - age * 0.25);

			if (course.region) {
				course.region = ensure.region(course.region);
			} else {
				/* place in random test region, Spilistan or Testistan */
				course.region = prng() > 0.85 ? '9JyFCoKWkxnf8LWPh' : 'EZqQLGL4PtFCxCNrp';
			}

			if (!course.groups) {
				course.groups = [];
			}
			course.groups = course.groups.map(ensure.group);
			course.groupOrganizers = [];
			Courses.insert(course);
		}

		return "Inserted " + courses.length + " course fixtures.";
	};


	/** Generate events for each course
	  *
	  * For each course, zero or more events are generated. Some will be in
	  * the past, some in the future.
	  */
	const eventsGenerate = function() {
		var prng = Prng("eventsGenerate");
		var count = 0;

		var venues =
			[ "Haus am See"
			, "Kongresszentrum"
			, "Volkshaus"
			, "SQ131"
			, "Caffee Zähringer"
			, "Restaurant Krone"
			, "Hischengraben 3"
			, "SQ125"
			, "Hub"
			, "ASZ"
			, "ASZ"
			];

		var rooms =
			[ 'Grosser Saal'
			, 'Vortragsraum'
			, 'Erkerzimmer'
			, 'Mirror-room'
			, 'Garden'
			, '5'
			, 'Moscow'
			, 'Moscow'
			];

		Courses.find().forEach(function(course) {
			var eventCount =  Math.floor(Math.pow(prng() * 1.6, 10));
			for (var n = 0; n < eventCount; n++) {
				var event = {};
				var description = course.description;
				if (!description) description = "No description"; // :-(
				var words = _.shuffle(description.split(' '));
				event.region = course.region;
				event.groups = course.groups;
				event.groupOrganizers = [];

				var venue = venues[Math.floor(prng() * venues.length)];
				event.venue = ensure.venue(venue, event.region);

				if (prng() > 0.6) {
					event.room = rooms[Math.floor(prng() * rooms.length)];
				}

				event.internal = prng() < 0.07;

				event.courseId = course._id;
				event._id = ensure.fixedId([ course._id, ""+n ]);
				event.title = course.name + ' ' + _.sample(words);
				event.description =  HtmlTools.saneHtml(words.slice(0, 10 + Math.floor(prng() * 30)).join(' '));
				event.groups = course.groups;

				var relativeDate = prng() - 0.7; // put 70% in the past, linear distribution
				// exponential decrease for events in the future
				if (relativeDate > 0) {
					relativeDate = Math.pow(relativeDate * 5, 2);
				}

				var spread = 1000 * 60 * 60 * 24 * 365 * 1.24; // 1.2 years in ms
				timeOffset = Math.floor(relativeDate * spread);
				var date = new Date(new Date().getTime() + timeOffset);
				var hour = date.getHours();

				// Events outside daylight 8-21 should be unlikely
				if (prng() > 0.2 && (hour < 8 || hour > 21)) date.setHours(hour + 12);

				// Quarter hours should be most common
				if (prng() > 0.05) date.setMinutes(Math.floor((date.getMinutes()) / 15) * 15);

				var regionZone = LocalTime.zone(event.region);

				event.startLocal = LocalTime.toString(date);
				event.start = regionZone.fromString(event.startLocal).toDate();
				event.endLocal = LocalTime.toString(new Date(date.getTime() + humandistrib(prng) * 1000 * 60 * 4));
				event.end = regionZone.fromString(event.endLocal).toDate();

				var members = course.members;
				var randomMember = members[Math.floor(Math.random()*members.length)];
				event.createdby = ensure.user(randomMember && randomMember.user || 'Serverscript')._id;
				var age = Math.floor(prng() * 10000000000);
				event.time_created = new Date(new Date().getTime() - age);
				event.time_lastedit = new Date(new Date().getTime() - age * 0.25);
				Events.insert(event);
			}

			count += eventCount;
		});

		return "Generated " + count + " course events.";
	};

	const commentsGenerate = function() {
		var prng = Prng("createComments");
		var count = 0;

		var userCount = Meteor.users.find().count();
		Courses.find().forEach(function(course) {
			var createCount =  Math.floor(Math.pow(prng() * 2, 4));
			var courseMembers = course.members.length;
			var description = course.description;
			if (!description) description = "No description"; // :-(
			var words = description.split(' ');

			for (var n = 0; n < createCount; n++) {
				var comment = {};
				comment.courseId = course._id;
				comment.title = _.sample(words, 1 + Math.floor(prng() * 3)).join(" ");
				comment.text =  HtmlTools.saneHtml(_.sample(words, 5).join(" ") + _.sample(words, Math.floor(prng() * 30)).join(' '));

				comment.time_created = sometimesAfter(course.time_created);
				comment.time_updated = (prng() < 0.9) ? comment.time_created : sometimesAfter(comment.time_created);

				var commenter = undefined;
				if (!course.members.length || prng() < 0.2) {
					// Leave some anonymous comments
					if (prng() < 0.7) {
						commenter = Meteor.users.findOne({}, {skip: Math.floor(prng()*userCount)})._id;
					}
				} else {
					commenter = course.members[Math.floor(prng()*courseMembers)];
				}
				comment.userId = commenter.user;
				CourseDiscussions.insert(comment);
			}

			count += createCount;
		});

		return "Generated " + count + " course comments.";
	};

	Meteor.methods({
		'fixtures.clean': function() {
			Groups.remove({});
			Events.remove({});
			Venues.remove({});
			Courses.remove({});
		},

		'fixtures.create': function() {
			if (Regions.find().count() === 0) regionsCreate();
			groupsCreate();
			venuesCreate();
			coursesCreate();
			eventsGenerate();
		},

		'fixtures.regions.create': regionsCreate,
		'fixtures.groups.create': groupsCreate,
		'fixtures.events.create': eventsCreate,
		'fixtures.venues.create': venuesCreate,
		'fixtures.courses.create': coursesCreate,
		'fixtures.events.generate': eventsGenerate,
		'fixtures.comments.generate': commentsGenerate
	});
}
