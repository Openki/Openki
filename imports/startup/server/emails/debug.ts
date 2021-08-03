import { Meteor } from 'meteor/meteor';
import { Email } from 'meteor/email';
import fs from 'fs';

if (Meteor.isDevelopment) {
	// Create /.temp to output emails as html files for testing
	(Email as any).hookSend((email: any) => {
		fs.writeFile(
			`${process.env.PWD}/.temp/${new Date().toISOString()} ${email.subject}.html`,
			email.html,
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			() => {},
		);

		return true;
	});
}
