import { Meteor } from 'meteor/meteor';
import Log from './log';

Meteor.methods({
	'log.clientError'(report) {
		check(
			report,
			{
				name: String,
				message: String,
				location: String,
				tsClient: Date,
				clientId: String,
				userAgent: String,
			},
		);
		// eslint-disable-next-line no-param-reassign
		report.connectionId = this.connection.id;

		const rel = [report.name, report.connectionId, report.clientId];
		const userId = Meteor.userId();
		if (userId) {
			// eslint-disable-next-line no-param-reassign
			report.userId = userId;
			rel.push(userId);
		}
		Log.record('clientError', rel, report);
	},
});
