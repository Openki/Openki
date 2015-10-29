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
// address:     Address string of the location
//
// "route"         -> String
// "description"   -> String
// "contact"       -> {"meetings","email","web","fon"... -> strings}
// "picture"       -> String   (lokal/external link)
// "infra"         -> not clear jet
// "createdby"     -> ID_user
// "hosts"         -> [ID_users]
// "roles"         -> WTF?
// "contacts"      -> [ID_users]
// "time_created"  -> Date
// "time_lastedit" -> Date
// "loc"           -> Geodata {type:Point, coordinates: [long, lat]}  (not lat-long !)
// ===========================


Locations = new Meteor.Collection("Locations");
if (Meteor.isServer) Locations._ensureIndex({loc : "2dsphere"});



Locations.allow({
	update: function (userId, doc, fieldNames, modifier) {
		return userId && true;   // allow only if UserId is present
	},
	insert: function (userId, doc) {
		return userId && true;   // allow only if UserId is present
	},
	remove: function (userId, doc) {
		return userId && true;   // allow only if UserId is present
	},
});

/* Find locations for given filters
 *
 * filter: dictionary with filter options
 *   query: string of words to search for
 *   region: restrict to locations in that region
 * limit: how many to find
 *
 */
locationsFind = function(filter, limit) {
	var find = {};

	if (limit > 0) {
		options.limit = limit;
	}

	if (filter.region) {
		find.region = filter.region;
	}

	if (filter.search) {
		var searchTerms = filter.search.split(/\s+/);
		find.$and = _.map(searchTerms, function(searchTerm) {
			return { title: { $regex: escapeRegex(searchTerm), $options: 'i' } };
		});

		find.$and = searchQueries;
	}
	return Events.find(find, options);
}

Meteor.methods({

	save_location: function(locationId, changes) {
		check(locationId, String)
		check(changes, {
			description: Match.Optional(String),
			hosts: 		 [String],
			name:        Match.Optional(String),
			region:      Match.Optional(String),
			address:     Match.Optional(String),
			route:       Match.Optional(String),
			maxpeople:   Match.Optional(String),
			maxworkplaces:   Match.Optional(String)
		})

		var user = Meteor.user()
		if (!user) {
		    if (Meteor.is_client) {
				pleaseLogin();
				return;
			} else {
				throw new Meteor.Error(401, "please log in")
			}
		}

		var location;
		var isNew = locationId.length == 0
		if (!isNew) {
			location = Locations.findOne({_id: locationId})
			if (!location) throw new Meteor.Error(404, "Location not found")
		}

		/* Changes we want to perform */
		var set = {}


		if (changes.description) set.description = changes.description.substring(0, 640*1024) /* 640 k ought to be enough for everybody */
		if (changes.name) {
		    set.name = changes.name.substring(0, 1000)
		    set.slug = getSlug(set.name);
		}

		if (changes.address) set.address = changes.address.substring(0, 40*1024)
		if (changes.route) set.route = changes.route.substring(0, 40*1024)
		if (changes.maxpeople) set.maxpeople = changes.maxpeople.substring(0, 10)
		if (changes.maxworkplaces) set.maxworkplaces = changes.maxworkplaces.substring(0, 10)
		set.hosts=changes.hosts

		set.time_lastedit = new Date
		if (isNew) {
			/* region cannot be changed */
			set.region = Regions.findOne({_id: changes.region})._id
			if (!set.region) throw new Exception(404, 'region missing')

			locationId = Locations.insert({
				hosts: [user._id],
				createdby: user._id,
				time_created: new Date
			}, checkInsert)
		}

		Locations.update({ _id: locationId }, { $set: set }, checkUpdateOne)

		return locationId
	}
});


