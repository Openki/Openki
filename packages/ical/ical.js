function sendIcal(events, response) {
	var ical = Npm.require('ical-generator');
	var calendar = ical({ name: "Openki Calendar" });
	events.forEach(function(dbevent) {
		var end = dbevent.enddate || dbevent.startdate;
		calendar.addEvent({
			uid: dbevent._id,
			start: dbevent.startdate,
			end: end,
			summary: dbevent.title,
			location: [dbevent.location, dbevent.room].filter(function(s) { return !!s; }).join(', '),
			description: textPlain(dbevent.description),
			url: Router.routes['showEvent'].url(dbevent)
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
			sendIcal(eventsFind({}), this.response);
		}
	});
	this.route('calEvent', {
		path: 'cal/event/:_id',
		where: 'server',
		action: function () {
			sendIcal(Events.find({ _id: this.params._id }), this.response);
		}
	});
});