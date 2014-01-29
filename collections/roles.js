Roles = new Meteor.Collection("Roles");

var roles = [{
		'type':        'team',
		'description': 'look after the course',
		'subscribe':   'I help organize',
		'preset':      true,
		'show_subscribers': true,
		'protorole': { 'subscribed': [] }
	},{
		'type':        'interested',
		'description': 'are interested',
		'subscribe':   'I want to be notified when it starts',
		'preset':      true,
		'show_subscribers': false,
		'protorole': { 'subscribed': [] }
	},{
		'type':        'follow',
		'description': 'get informed',
		'subscribe':   'I want to be notified about all changes' ,
		'preset':      true,
		'show_subscribers': false,
		'protorole': { 'subscribed': [] }
	},{
		'type':        'participant',
		'description': 'take part',
		'subscribe':   'I want to take part',
		'show_subscribers': true,
		'fields': {
			'min': { 'type': 'int', 'description': 'minimal count of participants', 'optional': true },
			'max': { 'type': 'int', 'description': 'maximal count of participants', 'optional': true },
		},
		'protorole': { 'subscribed': [] }
	},{
		'type':        'mentor',
		'description': 'are a mentor',
		'subscribe':   'I can be a mentor',
		'show_subscribers': true,
		'protorole': { 'subscribed': [] }
	},{
		'type':        'host',
		'description': 'host the course',
		'subscribe':   'I have a room to host this',
		'show_subscribers': true,
		'fields': {
			'address': 'text'
		},
		'protorole': { 'subscribed': [] }
	},{
		'type':        'donator',
		'description': 'donate to the course',
		'subscribe':   'I want to donate',
		'show_subscribers': true,
		'protorole': { 'subscribed': [] }
	},{
		'type':        'cook',
		'description': 'cook for gatherings',
		'subscribe':   'I can bring food' ,
		'show_subscribers': true,
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
