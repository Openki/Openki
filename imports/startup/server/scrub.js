import { Meteor } from 'meteor/meteor';
import schedule from 'node-schedule';

import Log from '/imports/api/log/log';
import { Scrubber } from '/server/lib/scrub';


Meteor.startup(() => {
	const scrubSettings = Meteor.settings.scrub;
	if (scrubSettings) {
		const scrubber = Scrubber.read(scrubSettings);
		const scrubCall = Meteor.bindEnvironment(
			() => scrubber.scrub(Log, moment()),
		);

		// Run scrubber at midnight
		const daily = new schedule.RecurrenceRule();
		daily.hour = 0;
		daily.minute = 0;
		schedule.scheduleJob(daily, scrubCall);
	}
});
