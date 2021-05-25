import { Meteor } from 'meteor/meteor';

import fs from 'fs';
import path from 'path';

if (Meteor.isServer && Meteor.isDevelopment) {
	// Hack fix: The line https://github.com/gadicc/meteor-messageformat/blob/v2/packages/extract/extract.js#L244
	// breaks because the missing ()=>{} I prevent that this code is ever running.
	const EXTRACTS_FILE = 'server/extracts.msgfmt~';

	const relUp = path.join('..', '..', '..', '..', '..');
	const extractsFile = path.join.apply(null, [relUp].concat(EXTRACTS_FILE.split('/')));

	const dir = path.dirname(extractsFile);
	fs.exists(dir, (exists) => {
		if (exists) {
			const triggerFile = extractsFile.replace(/~$/, '');
			// eslint-disable-next-line no-shadow
			fs.exists(triggerFile, (exists) => {
				if (!exists) {
					fs.writeFile(triggerFile, `# Used by ${EXTRACTS_FILE}, do not delete.\n`, () => {});
				}
			});
		} else {
			fs.mkdir(dir, (err) => {
				if (err) throw err;
			});
		}
	});
}
