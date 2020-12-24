// Activate the following line to debug messageformat activities
// Package['jag:pince'].Logger.setLevel('msgfmt', 'trace');

// See: https://github.com/gadicc/meteor-messageformat/#optional-settings
msgfmt.init('en', {
	// Save setLocale() in Meteor.user().locale, sync to multiple clients (Default: true)
	storeUserLocale: true,

	// For safari older than v10 we need to connect to polyfill.io (Default: false)
	disableIntlPolyfill: false,
});
