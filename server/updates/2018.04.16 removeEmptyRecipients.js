/** Clean bogus null recipients
  *
  * Due to a programming error when an anonymous users commented
  * the log-record contained a null recipient. Remove those.
  */
UpdatesAvailable['2018.04.16 removeEmptyRecipients'] = function() {
	return Log.update(
		{ tr: "Notification.Send" },
		{ $pull: { 'body.recipients': null } },
		{ multi: true }
	);
};
