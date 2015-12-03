// ======== DB-Model: ========
// "_id"              -> ID
// "type"             -> String     (name of role)
// "icon"             -> String     ex: "glyphicon glyphicon-bullhorn"
// "description"      -> String     (not used)
// "subscribe"        -> String     (decription for subscription)
// "preset"           -> Boolean
// "show_subscribers" -> Boolean
// ===========================


Roles = new Meteor.Collection("Roles");

var roles = [{
		'type':        'team',
		'icon':        'glyphicon glyphicon-bullhorn',
		'alt_icon':    'fa fa-info-circle',
		'preset':      true,	//if true: allways available, not offered as choice in proposal
		'show_subscribers': true,
	},{
		'type':        'participant',
		'alt_icon':    'glyphicon glyphicon-user',
		'icon':        'fa fa-user-plus',
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
