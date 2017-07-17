
Router.map(function () {
	this.route('api.0.json.groups', {
		path: '/api/0/json/groups',
		where: 'server',
		action: function () {
			var groupQuery = Filtering(GroupPredicates).read(this.params.query).done().toQuery();
			var groups = GroupLib.find(groupQuery).fetch();

			_.each(groups, function(group) {
				group.link = Router.url('groupDetails', group);
			});

			this.response.setHeader('Content-Type', 'application/json; charset=utf-8');
			this.response.end(JSON.stringify(groups, null, "\t"));
		}
	});
});

Router.map(function () {
    this.route('api.0.json.venues', {
        path: '/api/0/json/venues',
        where: 'server',
        action: function () {
            var venueQuery = Filtering(VenuePredicates).read(this.params.query).done().toQuery();
            var venues = Venues.find(venueQuery).fetch();

			_.each(venues, function(venue) {
				venue.link = Router.url('venueDetails', venue);
			});

            this.response.setHeader('Content-Type', 'application/json; charset=utf-8');
            this.response.end(JSON.stringify(venues, null, "\t"));
        }
    });
});

Router.map(function () {
    this.route('api.0.json.events', {
        path: '/api/0/json/events',
        where: 'server',
        action: function () {
            var eventQuery = Filtering(EventPredicates).read(this.params.query).done().toQuery();
            var events = eventsFind(eventQuery).fetch();

			var result = _.map(events, function(ev) {
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
				for(var groupId of ev.groups) {
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
				};

				return evr;
			});

            this.response.setHeader('Content-Type', 'application/json; charset=utf-8');
            this.response.end(JSON.stringify(result, null, "\t"));
        }
    });
});
