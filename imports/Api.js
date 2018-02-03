import Courses from '/imports/api/courses/courses.js';
import Events from '/imports/api/events/events.js';
import Groups from '/imports/api/groups/groups.js';
import Venues from '/imports/api/venues/venues.js';

export default Api =
	{ groups:
		(filter) => {
			var groupQuery = Groups.Filtering().readAndValidate(filter).done().toQuery();
			return Groups.findFilter(groupQuery).map(group => {
				group.link = Router.url('groupDetails', group);
				return group;
			});
		}
	, venues:
		(filter) => {
			var venueQuery = Venues.Filtering().readAndValidate(filter).done().toQuery();
			return Venues.find(venueQuery).map(venue => {
				venue.link = Router.url('venueDetails', venue);
				return venue;
			});
		}
	, events:
		(filter) => {
			var eventQuery = Events.Filtering().readAndValidate(filter).done().toQuery();
			return Events.findFilter(eventQuery).map(ev => {
				var evr =
					{ id: ev._id
					, title: ev.title
					, description: ev.description
					, startLocal: ev.startLocal
					, endLocal: ev.endLocal
					, start: ev.start
					, end: ev.end
					, duration: moment(ev.end).diff(ev.start) / 60000 // Minutes
					, link: Router.url('showEvent', ev)
					, internal: ev.internal
					, room: ev.room
					};

				const creator = Meteor.users.findOne(ev.createdBy);
				if (creator) {
					evr.createdBy =
						{ id: creator._id
						, name: creator.username
						}
				}					

				if (ev.venue) {
					evr.venue =
						{ id: ev.venue._id
						, name: ev.venue.name
						, loc: ev.venue.loc
						, link: Router.url('venueDetails', ev.venue)
						};
				}

				if (ev.courseId) {
					let course = Courses.findOne(ev.courseId);
					if (course) {
						evr.course =
							{ id: ev.courseId
							, name: course.name
							, link: Router.url('showCourse', course)
							};
					}
				}

				evr.groups = [];
				var groups = ev.groups || [];
				for(var groupId of groups) {
					let group = Groups.findOne(groupId);
					if (group) {
						evr.groups.push(
							{ id: group._id
							, name: group.name
							, short: group.short
							, link: Router.url('groupDetails', group)
							}
						);
					}
				}

				return evr;
			});
		}
	};
