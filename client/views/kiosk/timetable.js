var makeFilterQuery = function(params) {
	var filter = Filtering(EventPredicates).read(params).done();

	var query = filter.toQuery();
	var now = minuteTime.get();
	query.period = [now, moment(now).add(1, 'days').toDate()];

	return query;
}

Router.map(function () {
	this.route('kioskTimetable', {
		path: '/kiosk/timetable',
		layoutTemplate: 'kioskLayout',
		waitOn: function () {
			return subs.subscribe('eventsFind', makeFilterQuery(this.params && this.params.query), 200);
		},
		data: function() {
			var query = makeFilterQuery(this.params.query);

			var start = undefined;
			var end = undefined;

			var events = eventsFind(query, 200).fetch();

			// collect time when first event starts and last event ends
			events.forEach(function(event) {
				if (!start || event.start < start    ) start = event.start;
				if (!end   || end         < event.end) end   = event.end;
			});

			start = start && start.getTime();
			end = end && end.getTime();
			var span = end - start;
			var perLocation = {};

			var useLocation = function(location) {
				var id = location._id || '#'+location.name;
				if (!perLocation[id]) {
					perLocation[id] = {
						location: location,
						rows: []
					};
				}
				return perLocation[id].rows;
			}

			events.forEach(function(event) {
				event.relStart = (event.start.getTime() - start) / span;
				event.relEnd   = (end - event.end.getTime()) / span;
				var placed = false;

				var locationRows = useLocation(event.location);
				for (var rowNr in locationRows) {
					var row = locationRows[rowNr];
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
					locationRows.push([event]);
				}
			});

			return _.toArray(perLocation);
		},
	});
});


Template.kioskTimetable.helpers({
	position: function() {
		return "background-color: #aaa; position: absolute; height: 3em; margin: 0.1em; overflow: hidden; left: "+this.relStart*100+"%; right: "+this.relEnd*100+"%;";
	}
});