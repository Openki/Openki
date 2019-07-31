const UpdatesAvailable = [];

// eslint-disable-next-line func-names
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
