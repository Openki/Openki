// ======== DB-Model: ========
// "type"             -> String     (name of role)
// "icon"             -> String     ex: "glyphicon glyphicon-bullhorn"
// "preset"           -> Boolean    For always-on roles
// "show_subscribers" -> Boolean
// ===========================

export default Roles =
	[
		{ 'type':        'participant'
		, 'icon':        'fa fa-user'
		, 'preset':      true
		, 'show_subscribers': true
		}
	,
		{ 'type':        'mentor'
		, 'icon':        'fa fa-graduation-cap'
		, 'show_subscribers': true
		}
	,
		{ 'type':        'host'
		, 'icon':        'glyphicon glyphicon-home'
		, 'show_subscribers': true
		}
	,
		{ 'type':        'team'
		, 'icon':        'glyphicon glyphicon-bullhorn'
		, 'preset':      true
		, 'show_subscribers': true
		}
	];
