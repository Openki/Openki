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
		'_id': 		   '9JyFCoKWkxnf8LWPh'
	},{
		'name':        'Spilistan',
		'_id': 		   'EZqQLGL4PtFCxCNrp'
    },{
		'name':        'Bern',
		'_id': 		   'Siifr2P7drkv66FNA'
	},{
		'name':        'Zürich',
		'_id': 		   'J6GDhEEvdmdSMzPPF'
	},{
		'name':        'Biel',
		'_id': 		   'Gkkr8Deb2ln4hGp7O'

    }
]

Meteor.startup(function () {
	if (Meteor.isServer && Regions.find().count() == 0) {
		_.each(regions, function(region){
			Regions.insert(region)
		})
	}
});

Meteor.publish ('regions', function(){
	return Regions.find();
});