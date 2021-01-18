// ======== DB-Model: ========
/**
 * @typedef {Object} RoleEntity
 * @property {string}  type               (name of role)
 * @property {string}  icon               ex: "fa fa-bullhorn"
 * @property {boolean} [preset]          For always-on roles
 * @property {boolean} show_subscribers
 */

/** @type {RoleEntity[]} */
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
