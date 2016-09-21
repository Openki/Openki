Meteor.methods({
	generateAnonId: function(){
		var newId = new Meteor.Collection.ObjectID();
		anonId = 'Anon_' + newId._str;
		Meteor.users.update(Meteor.userId(), {
			$push: { anonId: anonId }
		});
		return anonId;
	},
	updateUserLocale: function(locale){
		Meteor.users.update(Meteor.userId(), {
			$set: { 'profile.locale': locale }
		});
	}
});


////////  Geo-IP    find nearest region to IP of user
var closestRegion = function(address) {
	GeoIP = Npm.require('geoip-lite');
	check(address, String);

	var maxDistance = 200000; // meters
	var result = { address: address };

    if (address && address.indexOf('127.') === 0) {
		result.message = 'Using Testistan for localhost';
        result.region = Regions.findOne('9JyFCoKWkxnf8LWPh');
		return result;
    }

	result.lookup = GeoIP.lookup(address);

    if (Meteor.settings.testdata) {
		result.message = 'Deployed with testdata, using Spilistan region';
        result.region = Regions.findOne('EZqQLGL4PtFCxCNrp');
		return result;
	}

	if (!result.lookup) {
		result.message = "No result for GeoIP lookup";
		return result;
	}

	result.region = Regions.findOne({
		loc: { $near: {
			$geometry: {type: "Point", coordinates: result.lookup.ll.reverse()},
			$maxDistance: maxDistance
		}}
	});

	if (result.region) {
		result.message = "Found region " + result.region.name + ".";
	} else {
		result.message = "No region within " + maxDistance/1000 + " km.";
	}

	return result;
};


Meteor.methods({
	autoSelectRegion: function() {
		var connectingFrom = this.connection.clientAddress;
		if (!connectingFrom) return false;

		var closest = closestRegion(connectingFrom);
		return closest.region && closest.region._id;
	},

	closestRegion: function(address) {
		if (!address) {
			address = this.connection.clientAddress;
		}
		return closestRegion(address);
	},
});