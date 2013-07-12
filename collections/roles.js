Roles = new Meteor.Collection("Roles");

var roles = [{
		'type':        'team',
		'description': 'look after the course', 
		'subscribe':   'I help organize',
		'preset':      true,
		'protorole': { 'subscribed': [] }
	},{
		'type':        'interested',
		'description': 'are interested',
		'subscribe':   'I want to be notified when it starts',
		'preset':      true,
		'protorole': { 'subscribed': [] }
    },{
		'type':        'follow',
		'description': 'get informed',
		'subscribe':   'I want to be notified about all changes' ,
		'preset':      true,
		'protorole': { 'subscribed': [] }
    },{
		'type':        'participant',
		'description': 'take part',
		'subscribe':   'I want to take part',
		'fields': {
			'min': { 'type': 'int', 'description': 'minimal count of participants', 'optional': true },
			'max': { 'type': 'int', 'description': 'maximal count of participants', 'optional': true },
		},
		'protorole': { 'subscribed': [] }
    },{
		'type':        'mentor',
		'description': 'are a mentor',
		'subscribe':   'I can be a mentor' ,
		'protorole': { 'subscribed': [] }
    },{
		'type':        'host',
		'description': 'host the course',
		'subscribe':   'I have a room to host this',
		'fields': {
			'address': 'text'
		},
		'protorole': { 'subscribed': [] }
    },{
		'type':        'cook',
		'description': 'cook for gatherings',
		'subscribe':   'I can bring food' ,
		'protorole': { 'subscribed': [] }
    }
]

Meteor.startup(function () {
	if (Meteor.isServer && Roles.find().count() == 0) {
		_.each(roles, function(role){
			Roles.insert(role)
		})
	}
});