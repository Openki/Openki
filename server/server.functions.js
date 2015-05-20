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


////////  Geo-IP    find nearest region to IP of user
Meteor.methods({
	autoSelectRegion: function() {
		var ip = this.connection.clientAddress;

		if (ip.indexOf('127') === 0) {
			return '9JyFCoKWkxnf8LWPh'; // Testistan for localhost
		}

		var geo = GeoIP.lookup(ip);

		var closest = Regions.findOne({
			loc: { $near: {
				$geometry: {type: "Point", coordinates: geo.ll.reverse()},
				$maxDistance: 200000 // meters
			}}
		});

		if (closest) return closest._id;

		return false;
	}

});