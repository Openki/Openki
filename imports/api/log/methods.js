import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';

import Log from './log';

Meteor.methods({
	'log.clientError'(originalReport) {
		const report = { ...originalReport };
		check(report, {
			name: String,
			message: String,
			location: String,
			stack: Match.Optional(String),
			tsClient: Date,
			clientId: String,
			userAgent: String,
		});
		report.connectionId = this.connection.id;

		const rel = [report.name, report.connectionId, report.clientId];
		const userId = Meteor.userId();
		if (userId) {
			report.userId = userId;
			rel.push(userId);
		}
		Log.record('clientError', rel, report);
	},
});
