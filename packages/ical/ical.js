function sendIcal(events, response) {
	var ical = Npm.require('ical-generator');
	var calendar = ical({ name: "Openki Calendar" });
	var dname;

	events.forEach(function(dbevent) {
		var end = dbevent.end || dbevent.start;

		var location = [];
		if (dbevent.room) location.push(dbevent.room);
		if (dbevent.venue) {
			var venue = dbevent.venue;
			location.push(venue.name);
			if (venue.address) location.push(venue.address);
		}
		location = location.join(', ');

		var twoLines = /<(p|div|h[0-9])>/g;
		var oneLine = /<(ul|ol|li|br ?\/?)>/g;
		var lineDescription = dbevent.description.replace(twoLines, "\n\n").replace(oneLine, "\n").trim();
		var plainDescription = textPlain(lineDescription);
		calendar.addEvent({
			uid: dbevent._id,
			start: dbevent.start,
			end: end,
			summary: dbevent.title,
			location: location,
			description: plainDescription,
			url: Router.routes.showEvent.url(dbevent)
		});

		if (!dname) {
			var sName = getSlug(dbevent.title);
			var sDate = moment(dbevent.start).format("YYYY-MM-DD");
			dname = "openki-" + sName + '-' + sDate + '.ics';
		} else {
			dname = "openki-calendar.ics";
		}
	});

	var calendarstring = calendar.toString();

	response.writeHead(200, {
		'Content-Type': 'text/calendar; charset=UTF-8',
		'Content-Disposition': 'attachment; filename="' + dname + '"'
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
		path: 'cal/event/:_id.ics',
		where: 'server',
		action: function () {
			sendIcal(Events.find({ _id: this.params._id }), this.response);
		}
	});
	this.route('calCourse', {
		path: 'cal/course/:slug,:_id.ics',
		where: 'server',
		action: function () {
			sendIcal(Events.find({ courseId: this.params._id }), this.response);
		}
	});
});
