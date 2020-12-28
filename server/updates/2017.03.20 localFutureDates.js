// Legacy: This file is no longer relevant, it is only used for documentation purposes.

/*
import LocalTime from '/imports/utils/local-time';
import Log from '/imports/api/log/log';
import Events from '/imports/api/events/events';
import Regions from '/imports/api/regions/regions';

const updateName = '2017.03.20 localFutureDates';

const UpdatesAvailable = [];

UpdatesAvailable[updateName] = function () {
	let count = 0;

	const setTz = function (regionId, tz) {
		count += 1;
		Regions.update(regionId, { $set: { tz }, $unset: { timeZone: true } });
	};

	setTz('9JyFCoKWkxnf8LWPh', 'Europe/Zurich'); // Testistan
	setTz('EZqQLGL4PtFCxCNrp', 'Europe/Andorra'); // Spilistan
	setTz('MPKEnGGC8T9XyCCRG', 'America/Denver'); // Englistan
	setTz('4Je2iee208aLHS1Km', 'Asia/Jakarta'); // Yogyakarta
	setTz('Siifr2P7drkv66FNA', 'Europe/Zurich'); // Bern
	setTz('J6GDhEEvdmdSMzPPF', 'Europe/Zurich'); // Zürich
	setTz('doR7JQH0jDE7Uunp3', 'Europe/Zurich'); // Frauenfeld
	setTz('4Je2iee208aLHS1Km', 'Africa/Lagos'); // Limbe
	setTz('nH6iit84MueHhnl04', 'Europe/Copenhagen'); // Aarhus
	setTz('eK4J208d720baaLHSzHj0', 'Europe/Athens'); // Θεσσαλονίκη
	setTz('wj39hF2fen4fJ20822aa', 'Europe/Athens'); // Αθήνα
	setTz('Xj3EfKDQ4S1nzFo9', 'Europe/Zurich'); // Jura
	setTz('kEu49vBsKjei0opFs', 'Europe/Berlin'); // Berlin
	setTz('94HdfKJe2i34ht8aLdm"', 'Europe/Zurich'); // HomeMade2016
	setTz('4S3vnzFj3wjhgQzo9', 'Europe/London'); // London
	setTz('JEhc83S4SdsJE0e', 'Europe/Zurich'); // Fribourg
	setTz('wvoJEz0eSerrAJ', 'Europe/Zurich'); // Winterthur

	Events.find().forEach((event) => {
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
			Log.record(
				'Update.Error',
				rel,
				{
					event: event._id,
					error: e,
					update: updateName,
				},
			);
			// eslint-disable-next-line no-console
			console.log(`Unable to update local time for event ${event._id}: ${e}`);
		}
	});

	// Update calculated fields so they include the startLocal field.
	Meteor.call('course.updateNextEvent', {});

	return count;
};
*/
