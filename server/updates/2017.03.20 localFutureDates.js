import '/imports/LocalTime.js';

UpdatesAvailable['2017.03.20 localFutureDates'] = function() {
	var count = 0;
	Events.find().forEach(function(event) {
		var regionZone = LocalTime.zone(event.region);
		count += 1;
		Events.update(event.id,
			{ startLocal:    regionZone.toString(event.start)
			, endLocal:      regionZone.toString(event.end)
			}
		);
	});
	return count;
};