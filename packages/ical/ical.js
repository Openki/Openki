Router.map(function () {
	this.route('cal', {
		path: 'cal/',
		where: 'server',
		action: function () {
			var request = this.request;
			var response = this.response;
			
			var ical = Npm.require('ical-generator');
			var calendar = ical({ name: "Openki Calendar" });
			eventsFind({}).forEach(function(dbevent) {
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
			this.response.writeHead(200, {
				'Content-Type': 'text/calendar; charset=UTF-8'
			});
			response.write(calendarstring);
			response.end();
		}
	});
});