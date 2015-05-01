// ======== DB-Model: ========
// "_id" -> ID
// "name" -> string
// "timeZone" -> string
// ===========================Regions = new Meteor.Collection("Regions");

Regions = new Meteor.Collection("Regions");


Regions.allow({
	update: function (userId, doc, fieldNames, modifier) {
		return userId && false;
	},
	insert: function (userId, doc) {
		return userId && false;
	},
	remove: function (userId, doc) {
		return userId && false;
	}
});

////////  Geo-Ip

//GeoIP = Meteor.npmRequire('geoip-lite')

Meteor.methods({

	autoSelectRegion: function(clientIp) {
		var ip = clientIp
		//this.response.writeHead(200, {'Content-Type': 'application/json'});
		//this.response.end(          JSON.stringify(GeoIP.lookup(ip))      );
		return 'h6ZeeIBfp72msnnp3'  //for Luzern
	}

});
