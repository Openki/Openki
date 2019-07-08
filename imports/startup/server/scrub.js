import { Meteor } from 'meteor/meteor';
import schedule from 'node-schedule';

import Log from '/imports/api/log/log.js';
import { Scrubber } from '/server/lib/scrub.js';


Meteor.startup(function() {
    const scrubSettings = Meteor.settings.scrub;
    if (scrubSettings) {
        const scrubber = Scrubber.read(scrubSettings);
        const scrubCall = Meteor.bindEnvironment(
            () => scrubber.scrub(Log, moment())
        );

        // Run scrubber at midnight
        const daily = new schedule.RecurrenceRule();
        daily.hour = 0;
        daily.minute = 0;
        schedule.scheduleJob(daily, scrubCall);
        console.log("scheduled day job", new Date())
    }
});