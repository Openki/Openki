import fs from 'fs';
import path from 'path';

if (Meteor.isServer && Meteor.isDevelopment) {
	// Hack fix: The line https://github.com/gadicc/meteor-messageformat/blob/v2/packages/extract/extract.js#L244
	// breaks because the missing ()=>{} I prevent that this code is ever running.
	const EXTRACTS_FILE = 'server/extracts.msgfmt~';

	const relUp = path.join('..', '..', '..', '..', '..');
	const extractsFile = path.join.apply(null, [relUp].concat(EXTRACTS_FILE.split('/')));
	Meteor.startup(() => {
		const dir = path.dirname(extractsFile);
		fs.exists(dir, (exists) => {
			if (exists) {
				const triggerFile = extractsFile.replace(/~$/, '');
				// eslint-disable-next-line no-shadow
				fs.exists(triggerFile, (exists) => {
					if (!exists) { fs.writeFile(triggerFile, `# Used by ${EXTRACTS_FILE}, do not delete.\n`, () => {}); }
				});
			} else {
				fs.mkdir(dir, (err) => {
					if (err) throw err;
				});
			}
		});
	});
}

// Activate the following line to debug messageformat activities
// Package['jag:pince'].Logger.setLevel('msgfmt', 'trace');

// See: https://github.com/gadicc/meteor-messageformat/#optional-settings
msgfmt.init('en', {
	// Save setLocale() in Meteor.user().locale, sync to multiple clients (Default: true)
	storeUserLocale: true,

	// For safari older than v10 we need to connect to polyfill.io (Default: false)
	disableIntlPolyfill: false,
});
