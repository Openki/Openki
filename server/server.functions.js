Meteor.methods({
	insert_userdata: function(username, email, password){
		Accounts.createUser({username:username, email:email, password:password});
	},
	update_userdata: function(username, email, privacy) {
		var user = Meteor.user();
		
		var changes = {};
		if (user.username !== username) { changes.username = username; }
		if (user.privacy !== privacy) { changes.privacy = !!privacy; }
		if (!user.emails || !user.emails[0] || user.emails[0].address !== email) {
			// Working under the assumption that there is only one address
			// if there was more than one address oops I accidentally your addresses
			if (email && email.length > 3) {
				changes.emails = [{ address: email, verified: false }];
			} else {
				changes.emails = [];
			}
		} 

		if (!_.isEmpty(changes)) {
			Meteor.users.update(Meteor.userId(), {
				$set: changes
			});
		}
	},
	update_userpassword: function(new_password) {
		Accounts.setPassword(Meteor.userId(), new_password)
	},
	insert_anonId: function(anonId){
		Meteor.users.update(Meteor.userId(), {
			$push: {
				anonId: anonId
			}
		});
	}
});


// SETUP: Create Categories if not all anymore

createCategoriesIfNone = function() {
	if (Categories.find().count() === 0) {
		_.each(categories, function(category){
			Categories.insert(category)
		})
	}
}


////////  Geo-IP    find nearest region to IP of user

Meteor.methods({
	autoSelectRegion: function(ehemals_clientIp) {
		var regionId = '9JyFCoKWkxnf8LWPh'				//Testistan for localhost
		var clientIp = this.connection.clientAddress
		if (clientIp !== '127.0.0.1'){

			//var geoIp = Npm.require('geoip-lite');
			//var clientIp = "207.97.227.238";			//testing ...
			//var geo = geoIp.lookup(ip);
			//console.log(geo.country)
			var geo = {'ll': [47.556,8.8965]};			//(Frauenfeld) testing / tinkering ...


			/*  2d-version, if 2dsphere-$near doesn't work... (see testing.createnload.data.js)
			return Regions.findOne({loc: {$near: geo_ll}})._id;
			//, $maxDistance: 0.5 	//(in radians) for 2d only supportet from v2.6	on	
			*/

			return Regions.findOne({
				loc: {$near: {$geometry: {type: "Point", coordinates: geo.ll.reverse()},   
				$maxDistance: 200000}}  	//meters
			})._id;
		}

		return regionId
	}

});