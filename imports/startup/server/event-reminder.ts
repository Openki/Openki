import { Meteor } from 'meteor/meteor';
import schedule from 'node-schedule';
import moment from 'moment';

import { Events } from '/imports/api/events/events';
import { Log } from '/imports/api/log/log';
import { Notification } from '/imports/notification/notification';

Meteor.startup(() => {
	const reminderCall = Meteor.bindEnvironment(async () => {
		await Events.find({
			start: { $gt: moment().toDate(), $lt: moment().add(1, 'days').toDate() },
		}).forEachAsync(async (event) => {
			if (!event.participants?.length) {
				return;
			}

			const allreadySend = await Log.find({
				tr: 'Notification.Send',
				rel: event._id,
				'body.model': 'Event.Reminder',
			}).countAsync();

			if (allreadySend) {
				return;
			}

			Notification['Event.Reminder'].record(event._id);
		});
	});

	// Run every 5 Minutes
	schedule.scheduleJob('*/5 * * * *', reminderCall);
});
