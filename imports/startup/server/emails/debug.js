import { Meteor } from 'meteor/meteor';
import { Email } from 'meteor/email';
import fs from 'fs';

if (Meteor.isDevelopment) {
	// Create /.temp to output emails as html files for testing
	Email.hookSend((email) => {
		fs.writeFile(
			`${process.env.PWD}/.temp/${new Date().toISOString()} ${email.subject}.html`,
			email.html,
			() => {},
		);

		return true;
	});
}
