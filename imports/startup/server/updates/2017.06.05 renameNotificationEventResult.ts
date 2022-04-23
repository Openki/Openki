// Legacy: This file is no longer relevant, it is only used for documentation purposes.

/*
const UpdatesAvailable = [];

UpdatesAvailable['2017.06.05 renameNotificationEventResult'] = function () {
	const updSend = Log.update({ tr: 'Notification.Event' }, { $set: { tr: 'Notification.Send' } });
	const updResult = Log.update({ tr: 'Notification.EventResult' }, {
		$set:
		{
			tr: 'Notification.SendResult',
			model: 'Event',
		},
	});
	return updSend + updResult;
};
*/
