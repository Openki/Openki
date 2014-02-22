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


var regions = [{
		'name':        'Testistan',
		'_id':         '9JyFCoKWkxnf8LWPh',
		'timeZone':    'UTC+01:00'
	},{
		'name':        'Spilistan',
		'_id':         'EZqQLGL4PtFCxCNrp',
		'timeZone':    'UTC+03:00'
	},{
		'name':        'Bern',
		'_id':         'Siifr2P7drkv66FNA',
		'timeZone':    'UTC+01:00'
	},{
		'name':        'Zürich',
		'_id':         'J6GDhEEvdmdSMzPPF',
		'timeZone':    'UTC+01:00'
	},{
		'name':        'Biel',
		'_id':         'Gkkr8Deb2ln4hGp7O',
		'timeZone':    'UTC+01:00'
	},{
		'name':        'Luzern',
		'_id':         'h6ZeeIBfp72msnnp3',
		'timeZone':    'UTC+01:00'
	}
]


Meteor.startup(function () {
	if (Meteor.isServer && Regions.find().count() == 0) {
		_.each(regions, function(region){
			Regions.insert(region)
		})
	}
});
