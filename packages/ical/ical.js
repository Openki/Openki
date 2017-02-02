function sendIcal(events, response) {
	var ical = Npm.require('ical-generator');
	var calendar = ical({ name: "Openki Calendar" });
	events.forEach(function(dbevent) {
		var end = dbevent.end || dbevent.start;

		var location = [];
		if (dbevent.venue) location.push(dbevent.venue.name);
		if (dbevent.room) location.push(dbevent.room);
		location = location.join(', ');

		calendar.addEvent({
			uid: dbevent._id,
			start: dbevent.start,
			end: end,
			summary: dbevent.title,
			location: location,
			description: textPlain(dbevent.description),
			url: Router.routes.showEvent.url(dbevent)
		});
	});

	var calendarstring = calendar.toString();
	response.writeHead(200, {
		'Content-Type': 'text/calendar; charset=UTF-8'
	});

	response.write(calendarstring);
	response.end();
}

Router.map(function () {
	this.route('cal', {
		path: 'cal/',
		where: 'server',
		action: function () {
			var filter = Filtering(EventPredicates);
			var query = this.params.query || {};

			filter
				.add('start', moment())
				.read(query)
				.done();

			sendIcal(eventsFind(filter.toQuery()), this.response);
		}
	});
	this.route('calEvent', {
		path: 'cal/event/:_id',
		where: 'server',
		action: function () {
			sendIcal(Events.find({ _id: this.params._id }), this.response);
		}
	});
	this.route('calCourse', {
		path: 'cal/course/:_id',
		where: 'server',
		action: function () {
			sendIcal(Events.find({ courseId: this.params._id }), this.response);
		}
	});
});
