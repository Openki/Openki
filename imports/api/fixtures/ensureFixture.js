import crypto from 'crypto';
import Prng from './Prng';
import Groups from '/imports/api/groups/groups';
import Regions from '/imports/api/regions/regions';
import Venues from '/imports/api/venues/venues';

const ensure = {
	fixedId(strings) {
		const md5 = crypto.createHash('md5');
		strings.forEach((str) => md5.update(str));
		return md5.digest('hex').substring(0, 10);
	},

	user(name, verified) {
		const prng = Prng('ensureUser');

		if (!name) {
			/* eslint-disable-next-line no-param-reassign */
			name = 'Ed Dillinger';
		}
		const email = `${name.split(' ').join('')}@openki.example`.toLowerCase();

		/* eslint-disable-next-line no-constant-condition */
		while (true) {
			let user = Meteor.users.findOne({ 'emails.address': email });
			if (user) {
				return user;
			}

			user = Meteor.users.findOne({ username: name });
			if (user) {
				return user;
			}

			const id = Accounts.createUser({
				username: name,
				email,
				profile: { name },
				notifications: true,
				acceptsMessages: true,
			});

			const age = Math.floor(prng() * 100000000000);
			const time = new Date().getTime();
			Meteor.users.update({ _id: id }, {
				$set: {
				// Every password is set to "greg".
				// Hashing a password with bcrypt is expensive so we use the
				// computed hash.
					services: { password: { bcrypt: '$2a$10$pMiVQDN4hfJNUk6ToyFXQugg2vJnsMTd0c.E0hrRoqYqnq70mi4Jq' } },
					createdAt: new Date(time - age),
					lastLogin: new Date(time - age / 30),
				},
			});

			if (verified) {
				Meteor.users.update({ _id: id }, {
					$set: { 'emails.0.verified': true },
				});
			}
		}
	},

	region(name) {
		/* eslint-disable-next-line no-constant-condition */
		while (true) {
			const region = Regions.findOne({ name });
			if (region) {
				return region._id;
			}

			const id = Regions.insert({
				name,
				loc: { type: 'Point', coordinates: [8.3, 47.05] },
			});
			/* eslint-disable-next-line no-console */
			console.log(`Added region: ${name} ${id}`);
		}
	},

	group(short) {
		/* eslint-disable-next-line no-constant-condition */
		while (true) {
			const group = Groups.findOne({ short });
			if (group) {
				return group._id;
			}

			const id = ensure.fixedId([short]);
			Groups.insert({
				_id: id,
				name: short,
				short,
				members: [ensure.user('EdDillinger')._id],
				description: 'Fixture group',
			});
			/* eslint-disable-next-line no-console */
			console.log(`Added fixture group '${short}' id: ${id}`);
		}
	},

	venue(name, regionId) {
		const prng = Prng('ensureVenue');

		/* eslint-disable-next-line no-constant-condition */
		while (true) {
			let venue = Venues.findOne({ name, region: regionId });
			if (venue) {
				return venue;
			}

			venue = {
				name,
				region: regionId,
			};

			const region = Regions.findOne(regionId);
			const lat = region.loc.coordinates[1] + (prng() ** 2) * 0.02 * (prng() > 0.5 ? 1 : -1);
			const lon = region.loc.coordinates[0] + (prng() ** 2) * 0.02 * (prng() > 0.5 ? 1 : -1);
			venue.loc = { type: 'Point', coordinates: [lon, lat] };

			venue._id = ensure.fixedId([venue.name, venue.region]);

			const age = Math.floor(prng() * 80000000000);
			venue.time_created = new Date(new Date().getTime() - age);
			venue.time_lastedit = new Date(new Date().getTime() - age * 0.25);

			Venues.insert(venue);
		}
	},
};

export default ensure;
