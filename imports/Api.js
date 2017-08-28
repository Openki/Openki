NoActionError = function(message) {
	this.message = message;
}

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
		if (e instanceof FilteringReadError
		 || e instanceof NoActionError
		) {
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

let Api =
	{ groups:
		(filter) => {
			var groupQuery = Filtering(GroupPredicates).readAndValidate(filter).done().toQuery();
			return GroupLib.find(groupQuery).map(group => {
				group.link = Router.url('groupDetails', group);
				return group;
			});
		}
	, venues:
		(filter) => {
			var venueQuery = Filtering(VenuePredicates).readAndValidate(filter).done().toQuery();
			return Venues.find(venueQuery).map(venue => {
				venue.link = Router.url('venueDetails', venue);
				return venue;
			});
		}
	, events:
		(filter) => {
			var eventQuery = Filtering(EventPredicates).readAndValidate(filter).done().toQuery();
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
	};

Router.map(function () {
	this.route('api.0.json', {
		path: '/api/0/json/:handler',
		where: 'server',
		action: function() {
			jSendResponder(this.response, () => {
				let handler = this.params.handler;
				if (!Api.hasOwnProperty(handler)) {
					throw new NoActionError("Invalid action")
				}
				let query = this.params.query;
				return Api[handler](query);
			});
		}
	});
});
