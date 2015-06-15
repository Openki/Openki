Meteor.startup(function () {

	if (Meteor.settings.testdata) {
		createGroupsIfNone();          // Groups     from server/data/testing.groups.js
		createTestRegionsIfNone();     // Regions    from server/data/testing.regions.js
		createCoursesIfNone(Meteor.settings.testdata);
		createLocationsIfNone();       // Locations  from server/data/testing.locations.js
		createEventsIfNone();          // Events     in   server/testing.createnload.data.js (generic)
		loadTestEvents();              // Events     from server/data/testing.events.js
	}

	var serviceConf = Meteor.settings.service;
	if (serviceConf) {
		if (serviceConf.facebook) {
			ServiceConfiguration.configurations.remove({
				service: 'facebook'
			});
			ServiceConfiguration.configurations.insert({
				service: 'facebook',
				loginStyle: "popup",
				appId: serviceConf.facebook.appId,
				secret: serviceConf.facebook.secret
			});
		}
		if (serviceConf.github) {
			ServiceConfiguration.configurations.remove({
				service: "github"
			});
			ServiceConfiguration.configurations.insert({
				service: "github",
				loginStyle: "popup",
				clientId: serviceConf.github.clientId,
				secret: serviceConf.github.secret
			});
		}
	}
	
	if (Meteor.settings.admins) {
		for (name in Meteor.settings.admins) {
			var user = Meteor.users.findOne({ username: Meteor.settings.admins[name]});
			if (user) {
				Meteor.users.update({_id: user._id}, { $addToSet: { privileges: 'admin' }});
			}
		}
	}
	var emailConf = Meteor.settings.email;
	if (emailConf) {
		if (emailConf.mailgun) {
			process.env.MAIL_URL = emailConf.mailgun
			console.info('email configured to: '+emailConf.mailgun+' …done')
		}
	}
});
