import { Meteor } from 'meteor/meteor';
import { SSR } from 'meteor/meteorhacks:ssr';

import { Log } from '/imports/api/log/log';
import Notification from '/imports/notification/notification';

// Watch the Log for event notifications
Meteor.startup(() => {
	SSR.compileTemplate('notificationEventEmail', Assets.getText('emails/notifications/event.html'));
	SSR.compileTemplate(
		'notificationCommentEmail',
		Assets.getText('emails/notifications/comment.html'),
	);
	SSR.compileTemplate('notificationJoinEmail', Assets.getText('emails/notifications/join.html'));
	SSR.compileTemplate(
		'notificationGroupCourseEmail',
		Assets.getText('emails/notifications/group.course.html'),
	);
	SSR.compileTemplate(
		'notificationPrivateMessageEmail',
		Assets.getText('emails/notifications/privateMessage.html'),
	);

	// To avoid sending stale notifications, only consider records added in the
	// last hours. This way, if the server should have failed for a longer time,
	// no notifications will go out.
	const gracePeriod = new Date();
	gracePeriod.setHours(gracePeriod.getHours() - 72);

	// The Log is append-only so we only watch for additions
	Log.find({ tr: 'Notification.Send', ts: { $gte: gracePeriod } }).observe({
		added: Notification.send,
	});
});
