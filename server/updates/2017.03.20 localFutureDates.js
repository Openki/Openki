import '/imports/LocalTime.js';

UpdatesAvailable['2017.03.20 localFutureDates'] = function() {
	var count = 0;
	Events.find().forEach(function(event) {
		count += 1;
		Events.update(event.id,
			{ start:    LocalTime.fromGlobal(event.start, event.region)
		    , end:      LocalTime.fromGlobal(event.end, event.region)
			, startUTC: event.start
			, endUTC:   event.end
			}
		);
	});
	return count;
};