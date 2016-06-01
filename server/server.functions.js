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
				if (Meteor.users.findOne({ _id: { $ne: user._id }, 'emails.address': email })) {
					throw new Meteor.Error('emailExists', 'Email address already in use');
				}
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
Meteor.methods({
	autoSelectRegion: function() {
		var ip = this.connection.clientAddress;

		if (ip && ip.indexOf('127') === 0) {
			return '9JyFCoKWkxnf8LWPh'; // use Testistan for localhost
		}
		if (Meteor.settings.testdata) {
			return 'EZqQLGL4PtFCxCNrp';  // use Spilistan if deployed with testdata
		}

		var geo = GeoIP.lookup(ip);

		if (!geo) {
			return false;
		}

		var closest = Regions.findOne({
			loc: { $near: {
				$geometry: {type: "Point", coordinates: geo.ll.reverse()},
				$maxDistance: 200000 // meters
			}}
		});

		if (closest) return closest._id;
		return false;
	},

	ipToGeo: function(ip) {
//console.log (GeoIP.lookup(ip));
		return GeoIP.lookup(ip);
	},
});