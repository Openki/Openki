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
		'gl_icon':     'glyphicon glyphicon-bullhorn',
		'fa_icon':     'fa fa-info-circle fa fa-connectdevelop',
		'preset':      true,	//if true: allways available, not offered as choice in proposal
		'show_subscribers': true,
	},{
		'type':        'participant',
		'gl_icon':     'glyphicon glyphicon-user',
		'fa_icon':     'fa fa-users',
		'preset':      true,
		'show_subscribers': true
	},{
		'type':        'mentor',
		'gl_icon':     'glyphicon glyphicon-education',
		'fa_icon':     'fa fa-graduation-cap',
		'show_subscribers': true,
	},{
		'type':        'host',
		'gl_icon':     'glyphicon glyphicon-home',
		'fa_icon':     'fa fa-home',
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
