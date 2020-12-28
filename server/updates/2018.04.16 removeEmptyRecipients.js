// Legacy: This file is no longer relevant, it is only used for documentation purposes.

/*
import UpdatesAvailable from '/server/lib/updates';
// Clean bogus null recipients

// Due to a programming error when an anonymous users commented
// the log-record contained a null recipient. Remove those.

// eslint-disable-next-line no-undef
UpdatesAvailable['2018.04.16 removeEmptyRecipients'] = function () {
	return Log.update(
		{ tr: 'Notification.Send' },
		{ $pull: { 'body.recipients': null } },
		{ multi: true },
	);
};
*/
