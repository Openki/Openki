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
		'icon':        'glyphicon glyphicon-bullhorn',
		'alt_icon':    'fa fa-info-circle fa fa-connectdevelop',
		'preset':      true,	//if true: allways available, not offered as choice in proposal
		'show_subscribers': true,
	},{
		'type':        'participant',
		'alt_icon':    'glyphicon glyphicon-user',
		'icon':        'fa fa-users',
		'preset':      true,
		'show_subscribers': true
	},{
		'type':        'mentor',
		'alt_icon':    'glyphicon glyphicon-education',
		'icon':        'fa fa-graduation-cap',
		'show_subscribers': true,
	},{
		'type':        'host',
		'icon':        'glyphicon glyphicon-home',
		'alt_icon':    'fa fa-home',
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
