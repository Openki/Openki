UpdatesAvailable["2017.06.05 renameNotificationEventResult"] = function() {
	return Log.update
		( { 'tr': 'Notification.EventResult' }
		, { $set:
			{ 'tr': 'Notification.SendResult'
			, 'model': 'Event'
			}
		  }
		);
};
