// Legacy: This file is no longer relevant, it is only used for documentation purposes.

/*
import LocalTime from '/imports/utils/local-time';
import Log from '/imports/api/log/log';
import Events from '/imports/api/events/events';

const updateName = '2017.08.01 fixLocalDates';

const UpdatesAvailable = [];

UpdatesAvailable[updateName] = function () {
	let count = 0;

	Events.find({ replicaOf: { $not: { $size: 0 } } }).forEach((event) => {
		try {
			const regionZone = LocalTime.zone(event.region);
			Events.update(event._id, {
				$set:
				{
					startLocal: regionZone.toString(event.start),
					endLocal: regionZone.toString(event.end),
				},
			});
			count += 1;
		} catch (e) {
			const rel = [updateName, event._id];
			Log.record('Update.Error', rel, {
				event: event._id,
				error: e,
				update: updateName,
			});
			// eslint-disable-next-line no-console
			console.log(`Unable to update local time for event ${event._id}: ${e}`);
		}
	});

	return count;
};
*/
