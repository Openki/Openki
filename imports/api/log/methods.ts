import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Log } from '/imports/api/log/log';

import { ServerMethod } from '/imports/utils/ServerMethod';

export const clientError = ServerMethod(
	'log.clientError',
	function (originalReport: {
		name: string;
		message: string;
		location: string;
		stack: string;
		tsClient: Date;
		clientId: string;
		userAgent: string;
	}) {
		check(originalReport, {
			name: String,
			message: String,
			location: String,
			stack: String,
			tsClient: Date,
			clientId: String,
			userAgent: String,
		});
		const report: typeof originalReport & {
			userId?: string;
			connectionId?: string;
		} = { ...originalReport };
		report.connectionId = this.connection?.id;

		const rel = [report.name, report.connectionId, report.clientId].filter(
			(id) => !!id,
		) as string[];

		const userId = Meteor.userId();
		if (userId) {
			report.userId = userId;
			rel.push(userId);
		}
		Log.record('clientError', rel, report);
	},
);

export default clientError;
