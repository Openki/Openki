// _id          ID
// editor       user ID
// name         String
// description  String (HTML)
// region       region ID
// loc          GeoJSON coordinates
// address      String
// route        String

// Additional information
// short            String
// maxPeople        Int
// maxWorkplaces    Int
// facilities       {facility-key: Boolean}
// otherFacilities  String
// website          URL

/** Venue objects represent locations where events take place.
  */
Venue = function() {
	this.facilities = {};
};


/** Check whether a user may edit the venue.
  *
  * @param {Object} venue
  * @return {Boolean}
  */
Venue.prototype.editableBy = function(user) {
	if (!user) return false;
	var isNew = !this._id;
	return isNew // Anybody may create a new location
		|| user._id === this.editor
		|| privileged(user, 'admin'); // Admins can edit all venues
};

Venues = new Meteor.Collection("Venues", {
	transform: function(venue) {
		return _.extend(new Venue(), venue);
	}
});
if (Meteor.isServer) Venues._ensureIndex({loc : "2dsphere"});

Venues.facilityOptions =
	[ 'projector', 'screen', 'audio', 'blackboard', 'whiteboard'
	, 'flipchart', 'wifi', 'kitchen', 'wheelchairs'
	];

/* Find venues for given filters
 *
 * filter: dictionary with filter options
 *   search: string of words to search for
 *   region: restrict to venues in that region
 * limit: how many to find
 *
 */
venuesFind = function(filter, limit) {
	var find = {};
	var options = {};

	if (limit > 0) {
		options.limit = limit;
	}

	if (filter.region) {
		find.region = filter.region;
	}

	if (filter.search) {
		var searchTerms = filter.search.split(/\s+/);
		find.$and = _.map(searchTerms, function(searchTerm) {
			return { name: { $regex: escapeRegex(searchTerm), $options: 'i' } };
		});
	}

	return Venues.find(find, options);
};

if (Meteor.isServer) {
Meteor.methods({
	'venue.save': function(venueId, changes) {
		check(venueId, String);
		check(changes,
			{ name:            Match.Optional(String)
			, description:     Match.Optional(String)
			, region:          Match.Optional(String)
			, loc:             Match.Optional(Match.OneOf(null, { type: String, coordinates: [Number] }))
			, address:         Match.Optional(String)
			, route:           Match.Optional(String)
			, short:           Match.Optional(String)
			, maxPeople:       Match.Optional(Number)
			, maxWorkplaces:   Match.Optional(Number)
			, facilities:      Match.Optional([String])
			, otherFacilities: Match.Optional(String)
			, website:         Match.Optional(String)
			}
		);

		var user = Meteor.user();
		if (!user) {
			if (Meteor.is_client) {
				pleaseLogin();
				return;
			} else {
				throw new Meteor.Error(401, "please log in");
			}
		}

		var venue;
		var isNew = venueId.length === 0;
		if (!isNew) {
			venue = Venues.findOne(venueId);
			if (!venue) throw new Meteor.Error(404, "Venue not found");
		}

		/* Changes we want to perform */
		var set = { updated: new Date() };


		if (changes.description) set.description = saneHtml(changes.description.trim().substring(0, 640*1024));
		if (changes.name) {
			set.name = changes.name.trim().substring(0, 1000);
			set.slug = getSlug(set.name);
		}

		if (changes.address !== undefined) set.address = changes.address.trim().substring(0, 40*1024);
		if (changes.route !== undefined) set.route = changes.route.trim().substring(0, 40*1024);
		if (changes.short !== undefined) set.short = changes.short.trim().substring(0, 40);
		if (changes.loc !== undefined) {
			set.loc = changes.loc;
			set.loc.type = "Point";
		}

		if (changes.maxPeople !== undefined) set.maxPeople = Math.min(1e10, Math.max(0, changes.maxPeople));
		if (changes.maxWorkplaces !== undefined) set.maxWorkplaces = Math.min(1e10, Math.max(0, changes.maxWorkplaces));
		if (changes.facilities !== undefined) {
			set.facilities = _.reduce(changes.facilities, function(fs, f) {
				if (Venues.facilityOptions.indexOf(f) >= 0) {
					fs[f] = true;
				}
				return fs;
			}, {});
		}

		if (changes.otherFacilities) {
			set.otherFacilities = changes.otherFacilities.substring(0, 40*1024);
		}

		if (changes.website) {
			set.website = changes.website.substring(0, 40*1024);
		}

		if (isNew) {
			/* region cannot be changed */
			var region = Regions.findOne(changes.region);
			if (!region) throw new Meteor.Error(404, 'region missing');

			set.region = region._id;

			venueId = Venues.insert({
				editor: user._id,
				createdby: user._id,
				created: new Date()
			});
		}

		Venues.update({ _id: venueId }, { $set: set }, checkUpdateOne);

		return venueId;
	},

	'venue.remove': function(venueId) {
		check(venueId, String);
		var venue = Venues.findOne(venueId);
		if (!venue) {
			throw new Meteor.Error(404, "No such venue");
		}

		if (!venue.editableBy(Meteor.user())) {
			throw new Meteor.Error(401, "Please log in");
		}

		return Venues.remove(venueId);
	}

});
}
