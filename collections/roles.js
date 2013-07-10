Roles = new Meteor.Collection("Roles");

var roles = [{
		'type':        'initiator',
		'description': 'propose the course', 
		'subscribe':   'I propose',
		'preset':      true
	},{
		'type':        'interested',
		'description': 'are interested',
		'subscribe':   'I want to be notified when it starts',
		'preset':      true
    },{
		'type':        'follow',
		'description': 'get informed',
		'subscribe':   'I want to be notified about all changes' ,
		'preset':      true
    },{
		'type':        'participant',
		'description': 'take part',
		'subscribe':   'I want to take part',
		'fields': {
			'min': { 'type': 'int', 'description': 'minimal count of participants', 'optional': true },
			'max': { 'type': 'int', 'description': 'maximal count of participants', 'optional': true },
		}
    },{
		'type':        'mentor',
		'description': 'are a mentor',
		'subscribe':   'I can be a mentor' 
    },{
		'type':        'host',
		'description': 'host the course',
		'subscribe':   'I have a room to host this',
		'fields': {
			'address': 'text'
		}
    },{
		'type':        'cook',
		'description': 'cook for gatherings',
		'subscribe':   'I can bring food' 
    }
]

Meteor.startup(function () {
	if (Meteor.isServer && Roles.find().count() == 0) {
		_.each(roles, function(role){
			Roles.insert(role)
		})
	}
});