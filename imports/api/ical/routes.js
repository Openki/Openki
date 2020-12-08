import Events from '/imports/api/events/events';

import StringTools from '/imports/utils/string-tools';
import HtmlTools from '/imports/utils/html-tools';

import ical from 'ical-generator';

function sendIcal(events, response) {
	const calendar = ical({ name: 'Openki Calendar' });
	let dname;

	events.forEach(dbevent => {
		const end = dbevent.end || dbevent.start;

		let location = [];
		if (dbevent.room) {
			location.push(dbevent.room);
		}
		if (dbevent.venue) {
			const { venue } = dbevent;
			location.push(venue.name);
			if (venue.address) {
				location.push(venue.address);
			}
		}
		location = location.join(', ');

		const twoLines = /<(p|div|h[0-9])>/g;
		const oneLine = /<(ul|ol|li|br ?\/?)>/g;
		const lineDescription = dbevent.description.replace(twoLines, '\n\n').replace(oneLine, '\n').trim();
		const plainDescription = HtmlTools.textPlain(lineDescription);
		calendar.addEvent({
			uid: dbevent._id,
			start: dbevent.start,
			end,
			summary: dbevent.title,
			location,
			description: plainDescription,
			url: Router.routes.showEvent.url(dbevent),
		});

		if (!dname) {
			const sName = StringTools.slug(dbevent.title);
			const sDate = moment(dbevent.start).format('YYYY-MM-DD');
			dname = `openki-${sName}-${sDate}.ics`;
		} else {
			dname = 'openki-calendar.ics';
		}
	});

	const calendarstring = calendar.toString();

	response.writeHead(200, {
		'Content-Type': 'text/calendar; charset=UTF-8',
		'Content-Disposition': `attachment; filename="${dname}"`,
	});

	response.write(calendarstring);
	response.end();
}

/* eslint-disable-next-line array-callback-return */
Router.map(function () {
	this.route('cal', {
		path: 'cal/',
		where: 'server',
		action() {
			const filter = Events.Filtering();
			const query = this.params.query || {};

			filter
				.add('start', moment())
				.read(query)
				.done();

			sendIcal(Events.findFilter(filter.toQuery()), this.response);
		},
	});
	this.route('calEvent', {
		path: 'cal/event/:_id.ics',
		where: 'server',
		action() {
			sendIcal(Events.find({ _id: this.params._id }), this.response);
		},
	});
	this.route('calCourse', {
		path: 'cal/course/:slug,:_id.ics',
		where: 'server',
		action() {
			sendIcal(Events.find({ courseId: this.params._id }), this.response);
		},
	});
});
