import '/imports/collections/Log.js';

Meteor.methods({
	clientError: function(report) {
		check(report,
			{ name: String
			, message: String
			, location: String
			, tsClient: Date
			, clientId: String
			, userAgent: String
			}
		);
		report.connectionId = this.connection.id;

		const rel = [ report.name, report.connectionId, report.clientId ];
		const userId = Meteor.userId();
		if (userId) {
			report.userId = userId;
			rel.push(userId);
		}
		Log.record('clientError', rel, report);
	}
});
