import '/imports/LocalTime.js';
import '/imports/collections/Log.js';

var updateName = '2017.08.01 fixLocalDates';

UpdatesAvailable[updateName] = function() {
	var count = 0;

	Events.find({ replicaOf: {$not:{$size: 0}} }).forEach(function(event) {
		try {
			var regionZone = LocalTime.zone(event.region);
			Events.update(event._id, { $set:
				{ startLocal:    regionZone.toString(event.start)
				, endLocal:      regionZone.toString(event.end)
				}
			});
			count += 1;
		}
		catch (e) {
			var rel = [updateName, event._id];
			Log.record('Update.Error', rel,
				{ event: event._id
				, error: e
				, update: updateName
				}
			);
			console.log("Unable to update local time for event "+ event._id + ": " + e);
		}
	});

	return count;
};
