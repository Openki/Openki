var jSendResponder = function(res, process) {
	try {
		var data = process();
		let body =
			{ status: "success"
			, data: process()
			};
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json; charset=utf-8');
		res.end(JSON.stringify(body, null, "\t"));
	} catch(e) {
		let body = {};
		if (e instanceof FilteringReadError) {
			res.statusCode = 400;
			body.status = "fail";
			body.data = {};
			if (e.name) {
				body.data[e.name] = e.message;
			} else {
				body.data.error = e.message;
			}
		} else {
			res.statusCode = 500;
			body.status = "error";
			body.message = "Server error";
		}
		res.end(JSON.stringify(body, null, "\t"));
	}
}

Router.map(function () {
	this.route('api.0.json.groups', {
		path: '/api/0/json/groups',
		where: 'server',
		action: function () {
			jSendResponder(this.response, () => {
				var groupQuery = Filtering(GroupPredicates).readAndValidate(this.params.query).done().toQuery();
				var groups = GroupLib.find(groupQuery).fetch();

				_.each(groups, function(group) {
					group.link = Router.url('groupDetails', group);
				});
				return groups;
			});
		}
	});
});

Router.map(function () {
    this.route('api.0.json.venues', {
        path: '/api/0/json/venues',
        where: 'server',
        action: function () {
			jSendResponder(this.response, () => {
	            var venueQuery = Filtering(VenuePredicates).readAndValidate(this.params.query).done().toQuery();
	            var venues = Venues.find(venueQuery).fetch();
				_.each(venues, function(venue) {
					venue.link = Router.url('venueDetails', venue);
				});
				return venues;
			});
        }
    });
});

Router.map(function () {
    this.route('api.0.json.events', {
        path: '/api/0/json/events',
        where: 'server',
        action: function () {
			jSendResponder(this.response, () => {
	            var eventQuery = Filtering(EventPredicates).readAndValidate(this.params.query).done().toQuery();
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
					};

					return evr;
				});
				return result;
			});
        }
    });
});
