import '/imports/collections/Log.js';

Meteor.methods({
	clientError: function(report) {
		check(report,
			{ name: String
			, message: String
			, location: String
			, tsClient: Date
			}
		);
		const rel = [ report.name ];
		const userId = Meteor.userId();
		if (userId) {
			report.userId = userId;
			rel.push(userId);
		}
		Log.record('clientError', rel, report);
	}
});
