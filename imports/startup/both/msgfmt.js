import './msgfmt.fix';
import { msgfmt } from 'meteor/msgfmt:core';

// Activate the following line to debug messageformat activities
// Package['jag:pince'].Logger.setLevel('msgfmt', 'trace');

// See: https://github.com/gadicc/meteor-messageformat/#optional-settings
// Attention! The default options described in the readme are not the same as those set in the code.
msgfmt.waitOnLoaded = true; // waitOnLoaded must be set manually
msgfmt.init('en', {
	// Send translations for all languages or current language (Default: 'all')
	sendPolicy: 'current',

	// Don't invalidate msgfmt.locale() until new language is fully loaded (Default: false)
	waitOnLoaded: true,
	// Automatically adjust <body dir="rtl"> according to the language used (Default: true)
	setBodyDir: true,

	// Save setLocale() in Meteor.user().locale, sync to multiple clients (Default: true)
	storeUserLocale: true,

	// Use client's localStorage to avoid reloading unchanged translations (Default: true)
	useLocalStorage: true,

	// For safari older than v10 we need to connect to polyfill.io (Default: false)
	disableIntlPolyfill: false,
});
