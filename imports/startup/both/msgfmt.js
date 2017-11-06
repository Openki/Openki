// Activate the following line to debug messageformat activities
// Package['jag:pince'].Logger.setLevel('msgfmt', 'trace');

msgfmt.init('en', {
	disableIntlPolyfill: false    // false is default, for safari older than v10 we need to connect to polyfill.io
});
