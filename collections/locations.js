// ======== DB-Model: ========
// "_id" -> ID
// "name" -> string
// "region" -> ID_region
// "categories" -> string
// "maxPeople" -> int
// "maxWorkplaces" -> int
// "adress" -> string
// "route" -> string
// "description" -> string
// "contact" -> {"meetings","email","web","fon"... -> strings}
// "picture" -> string   (lokal/external link)
// "infra" -> not clear jet
// "createdby" -> ID_user
// "hosts" -> [ID_users]
// "contacts" -> [ID_users]
// ===========================



Locations = new Meteor.Collection("Locations");

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
				alert('please log in')
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

 		//var mayEdit = isNew || user.isAdmin || Locations.findOne({_id: locationId, roles:{$elemMatch: { user: user._id, roles: 'team' }}})
		//if (!mayEdit) throw new Meteor.Error(401, "get lost")


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

/* Need to find a good place to make these available to all */

function checkInsert(err, id) {
	if (err) throw err
}

function checkUpdateOne(err, aff) {
	if (err) throw err;
	if (aff != 1) throw "Query affected "+aff+" docs, expected 1"
}
