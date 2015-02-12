// ======== DB-Model: ========
// "_id" -> ID
// "type" -> string    (name of role)
// "description" -> string
// "subscribe" -> string  (decription for subscription)
// "preset" -> boolean
// "show_subscribers" -> boolean
// ===========================


Roles = new Meteor.Collection("Roles");

var roles = [{
		'type':        'team',
		'description': 'look after the course',
		'subscribe':   'I help organize',
		'preset':      true,					//if true: allways available, not offered as choice in proposal
		'show_subscribers': true,
	},{
		'type':        'participant',
		'description': 'take part',
		'subscribe':   'I want to take part',
		'show_subscribers': true,
		'fields': {
			'min': { 'type': 'int', 'description': 'minimal count of participants', 'optional': true },
			'max': { 'type': 'int', 'description': 'maximal count of participants', 'optional': true },
		},
	},{
		'type':        'mentor',
		'description': 'are a mentor',
		'subscribe':   'I can be a mentor',
		'show_subscribers': true,
	},{
		'type':        'host',
		'description': 'host the course',
		'subscribe':   'I have a room to host this',
		'show_subscribers': true,
		'fields': {
			'address': 'text'
		},
	}
]

Meteor.startup(function () {
    //Roles.remove({});
	if (Meteor.isServer && Roles.find().count() == 0) {
		_.each(roles, function(role){
			Roles.insert(role)
		})
	}
});
