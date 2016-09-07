// ======== DB-Model: ========
// "_id"           -> ID
// "name"          -> String
// "region"        -> ID_region
// "categories"    -> String
// "maxPeople"     -> Int
// "maxWorkplaces" -> Int
//
// loc:         GeoJSON coordinates of the location
//
// address:     Address string
//
// "route"         -> String
// "description"   -> String
// "contact"       -> {"meetings","email","web","fon"... -> strings}
// "picture"       -> String   (lokal/external link)
// "infra"         -> not clear jet
// "createdby"     -> ID_user
// "editor"        -> userId
// "contacts"      -> [ID_users]
// "time_created"  -> Date
// "time_lastedit" -> Date
// "loc"           -> Geodata {type:Point, coordinates: [long, lat]}  (not lat-long !)
// ===========================

/** Venue objects represent locations where events take place.
  */
Venue = function() {
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


Meteor.methods({
	'venue.save': function(venueId, changes) {
		check(venueId, String);
		check(changes, {
			name:          Match.Optional(String),
			description:   Match.Optional(String),
			region:        Match.Optional(String),
			address:       Match.Optional(String),
			route:         Match.Optional(String),
			maxpeople:     Match.Optional(Number),
			maxworkplaces: Match.Optional(Number)
		});

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
		var set = {};


		if (changes.description) set.description = changes.description.trim().substring(0, 640*1024);
		if (changes.name) {
			set.name = changes.name.trim().substring(0, 1000);
			set.slug = getSlug(set.name);
		}

		if (changes.address) set.address = changes.address.trim().substring(0, 40*1024);
		if (changes.route) set.route = changes.route.trim().substring(0, 40*1024);

		if (changes.maxpeople !== undefined) set.maxpeople = Math.min(1e10, Math.max(0, changes.maxpeople));
		if (changes.maxworkplaces !== undefined) set.maxworkplaces = Math.min(1e10, Math.max(0, changes.maxworkplaces));

		set.time_lastedit = new Date();
		if (isNew) {
			/* region cannot be changed */
			var region = Regions.findOne(changes.region);
			if (!region) throw new Meteor.Error(404, 'region missing');

			set.region = region._id;

			venueId = Venues.insert({
				editor: user._id,
				createdby: user._id,
				time_created: new Date()
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


