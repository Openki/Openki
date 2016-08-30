// ======== DB-Model: ========
// "_id"              -> ID
// "type"             -> String     (name of role)
// "icon"             -> String     ex: "glyphicon glyphicon-bullhorn"
// "description"      -> String     (not used)
// "subscribe"        -> String     (decription for subscription)
// "preset"           -> Boolean    For always-on roles
// "show_subscribers" -> Boolean
// "order"            -> Integer
// ===========================


Roles =
	[
		{ 'type':        'participant'
		, 'icon':        'fa fa-user-plus'
		, 'alt_icon':    'glyphicon glyphicon-user'
		, 'preset':      true
		, 'show_subscribers': true
		}
	,
		{ 'type':        'mentor'
		, 'icon':        'fa fa-graduation-cap'
		, 'alt_icon':    'glyphicon glyphicon-education'
		, 'show_subscribers': true
		}
	,
		{ 'type':        'host'
		, 'icon':        'glyphicon glyphicon-home'
		, 'alt_icon':    'fa fa-home'
		, 'show_subscribers': true
		}
	,
		{ 'type':        'team'
		, 'icon':        'glyphicon glyphicon-bullhorn'
		, 'alt_icon':    'fa fa-info-circle'
		, 'preset':      true
		, 'show_subscribers': true
		}
	];
