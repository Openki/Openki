var makeFilterQuery = function(params) {
	var filter = Filtering(EventPredicates).read(params).done();

	var query = filter.toQuery();

	var start;
	if (params.start) start = moment(params.start);
	if (!start || !start.isValid()) start = moment(minuteTime.get()).startOf('day');

	var end;
	if (params.end) end = moment(params.end);
	if (!end || !end.isValid()) end = moment(start).add(1, 'day');

	query.period = [start.toDate(), end.toDate()];

	return query;
};

Router.map(function () {
	this.route('timetable', {
		path: '/kiosk/timetable',
		layoutTemplate: 'timetableLayout',
		waitOn: function () {
			return subs.subscribe('eventsFind', makeFilterQuery(this.params && this.params.query), 200);
		},
		data: function() {
			var query = makeFilterQuery(this.params.query);

			var start;
			var end;

			var events = eventsFind(query, 200).fetch();

			// collect time when first event starts and last event ends
			events.forEach(function(event) {
				if (!start || event.start < start    ) start = event.start;
				if (!end   || end         < event.end) end   = event.end;
			});

			if (!start || !end) return [];

			start = moment(start).startOf('hour');
			end   = moment(end).startOf('hour');

			var startAbs = start.toDate().getTime();
			var endAbs   = end.toDate().getTime();

			var span = endAbs - startAbs;
			var days = {};
			var hours = {};
			var cursor = moment(start);
			do {
				var month = cursor.month();
				var day = cursor.day();
				days[''+month+day] = {
					moment: moment(cursor).startOf('day'),
					relStart: Math.max(-0.1, (moment(cursor).startOf('day').toDate().getTime() - startAbs) / span),
					relEnd:   Math.max(-0.1, (endAbs - moment(cursor).startOf('day').add(1, 'day').toDate().getTime()) / span)
				};
				var hour = cursor.hour();
				hours[''+month+day+hour] = {
					moment: moment(cursor).startOf('hour'),
					relStart: Math.max(-0.1, (moment(cursor).startOf('hour').toDate().getTime() - startAbs) / span),
					relEnd:   Math.max(-0.1, (endAbs - moment(cursor).startOf('hour').add(1, 'hour').toDate().getTime()) / span)
				};
				cursor.add(1, 'hour');
			} while(cursor.isBefore(end));

			var perVenue = {};
			var useVenue = function(venue) {
				var id = venue._id || '#'+venue.name;
				if (!perVenue[id]) {
					perVenue[id] = {
						venue: venue,
						rows: []
					};
				}
				return perVenue[id].rows;
			};

			events.forEach(function(event) {
				event.relStart = (event.start.getTime() - startAbs) / span;
				event.relEnd   = (endAbs - event.end.getTime()) / span;
				var placed = false;

				var venueRows = useVenue(event.venue);
				for (var rowNr in venueRows) {
					var row = venueRows[rowNr];
					var last = undefined;
					for (var eventNr in row) {
						var placedEvent = row[eventNr];
						if (!last || placedEvent.end > last) last = placedEvent.end;
					}
					if (last <= event.start) {
						row.push(event);
						placed = true;
						break;
					}
				}
				if (!placed) {
					venueRows.push([event]);
				}
			});

			return {
				days: _.toArray(days),
				hours: _.toArray(hours),
				grouped: _.toArray(perVenue)
			};
		},
	});
});


Template.timetable.helpers({
	position: function() {
		return "left: "+this.relStart*100+"%; right: "+this.relEnd*100+"%;";
	},
	showDay: function(moment) {
		return moment.format('dddd, LL');
	},
	showHour: function(moment) {
		return moment.format('H');
	}
});
