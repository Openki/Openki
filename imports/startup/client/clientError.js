window.addEventListener("error", function (event) {
	var report =
		{ name: event.error.name
		, message: event.error.message
		, location: window.location.href
		, tsClient: new Date()
		};
	Meteor.call('clientError', report);
});
