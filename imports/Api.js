var jSendResponder = function(res, process) {
	try {
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
			console.log(e)
			res.statusCode = 500;
			body.status = "error";
			body.message = "Server error";
		}
		res.end(JSON.stringify(body, null, "\t"));
	}
}

let Api = filter => {
	return (
		{ groups:
			() => {
				var groupQuery = Filtering(GroupPredicates).readAndValidate(filter).done().toQuery();
				return GroupLib.find(groupQuery).map(group => {
					group.link = Router.url('groupDetails', group);
				});
			}
		, venues:
			() => {
				var venueQuery = Filtering(VenuePredicates).readAndValidate(filter).done().toQuery();
				return Venues.find(venueQuery).map(venue => {
					venue.link = Router.url('venueDetails', venue);
					return venue;
				});
			}
		, events:
			() => {
		        var eventQuery = Filtering(EventPredicates).readAndValidate(route.params.query).done().toQuery();
		        return eventsFind(eventQuery).map(ev => {
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
			}
		}
	);
}

Router.map(function () {
	this.route('api.0.json.groups', {
		path: '/api/0/json/groups',
		where: 'server',
		action: function () {
			jSendResponder(this.response, Api(this.params.query).groups);
		}
	});
});

Router.map(function () {
    this.route('api.0.json.venues', {
        path: '/api/0/json/venues',
        where: 'server',
        action: function () {
			jSendResponder(this.response, Api(this.params.query).venues);
        }
    });
});

Router.map(function () {
    this.route('api.0.json.events', {
        path: '/api/0/json/events',
        where: 'server',
        action: function () {
			jSendResponder(this.response, Api(this.params.query).events);
        }
    });
});
