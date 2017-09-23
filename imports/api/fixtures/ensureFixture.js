var crypto = Npm.require('crypto');

export default ensure = {
	'fixedId': function(strings) {
		var md5 = crypto.createHash('md5');
		for (var str of strings) md5.update(str);
		return md5.digest('hex').substring(0, 10);
	},

	'user': function(name) {
		var prng = Prng('ensureUser');

		if (!name) {
			name = 'Ed Dillinger';
		}

		var email = (name.replace(' ', '') + "@openki.example").toLowerCase();

		while (true) {
			var user = Meteor.users.findOne({ "emails.address": email });
			if (user) return user;

			user = Meteor.users.findOne({ username: name });
			if (user) return user;

			var id = Accounts.createUser({
				username: name,
				email: email,
				profile: { name : name },
				notifications: true,
				acceptsMessages: true
			});

			var age = Math.floor(prng() * 100000000000);
			var time = new Date().getTime();
			Meteor.users.update({ _id: id }, { $set: {
				// Every password is set to "greg".
				// Hashing a password with bcrypt is expensive so we use the
				// computed hash.
				services : {"password" : {"bcrypt" : "$2a$10$pMiVQDN4hfJNUk6ToyFXQugg2vJnsMTd0c.E0hrRoqYqnq70mi4Jq"}},
				createdAt: new Date(time - age),
				lastLogin: new Date(time - age / 30)
			}});
		}
	},

	'region': function(name) {
		while (true) {
			var region = Regions.findOne({ name: name });
			if (region) return region._id;

			var id = Regions.insert({
				name: name,
				loc: { 'type': 'Point', 'coordinates': [ 8.3, 47.05 ] },
			});

			console.log("Added region: "+name+" "+id);
		}
	},

    'group': function(short) {
		while (true) {
			var group = Groups.findOne({ short: short });
			if (group) return group._id;

			var id = Groups.insert({
				name: short,
				short: short,
				members: [ ensure.user('EdDillinger') ],
				description: 'Fixture group'
			});

			console.log("Added group from TestCouses: "+short+" id: "+id);
		}
	},

	'venue': function(name, regionId) {
		var prng = Prng("ensureVenue");

		while (true) {
			var venue = Venues.findOne({ name: name, region: regionId });
			if (venue) return venue;

			venue = {
				name: name,
				region: regionId,
			};

			var region = Regions.findOne(regionId);
			var lat = region.loc.coordinates[1] + Math.pow(prng(), 2) * 0.02 * (prng() > 0.5 ? 1 : -1);
			var lon = region.loc.coordinates[0] + Math.pow(prng(), 2) * 0.02 * (prng() > 0.5 ? 1 : -1);
			venue.loc = { type: 'Point', coordinates: [ lon, lat ] };

			venue._id = ensure.fixedId([ venue.name, venue.region ]);

			var age = Math.floor(prng() * 80000000000);
			venue.time_created  = new Date(new Date().getTime() - age);
			venue.time_lastedit = new Date(new Date().getTime() - age * 0.25);

			Venues.insert(venue);
		}
	}
};
