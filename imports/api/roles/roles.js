// ======== DB-Model: ========
// "type"             -> String     (name of role)
// "icon"             -> String     ex: "fa fa-bullhorn"
// "preset"           -> Boolean    For always-on roles
// "show_subscribers" -> Boolean
// ===========================

const Roles = [
	{
		type: 'participant',
		icon: 'fa fa-user',
		preset: true,
		show_subscribers: true,
	},
	{
		type: 'mentor',
		icon: 'fa fa-graduation-cap',
		show_subscribers: true,
	},
	{
		type: 'host',
		icon: 'fa fa-home',
		show_subscribers: true,
	},
	{
		type: 'team',
		icon: 'fa fa-bullhorn',
		preset: true,
		show_subscribers: true,
	},
];

export default Roles;
