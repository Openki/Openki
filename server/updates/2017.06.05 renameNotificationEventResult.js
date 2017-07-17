UpdatesAvailable["2017.06.05 renameNotificationEventResult"] = function() {
	var updSend = Log.update( { 'tr': 'Notification.Event' }, { $set: { 'tr': 'Notification.Send' }});
	var updResult = Log.update
		( { 'tr': 'Notification.EventResult' }
		, { $set:
			{ 'tr': 'Notification.SendResult'
			, 'model': 'Event'
			}
		  }
		);
	return updSend + updResult;
};
