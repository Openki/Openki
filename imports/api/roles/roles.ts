// ======== DB-Model: ========
/**
 * @typedef {Object} RoleEntity
 * @property {string}  type               (name of role)
 * @property {string}  icon               ex: "fa fa-bullhorn"
 * @property {boolean} [preset]          For always-on roles
 */

/** @type {RoleEntity[]} */
export const Roles = [
	{
		type: 'participant',
		icon: 'fa fa-user',
		preset: true,
	},
	{
		type: 'mentor',
		icon: 'fa fa-graduation-cap',
	},
	{
		type: 'host',
		icon: 'fa fa-home',
	},
	{
		type: 'team',
		icon: 'fa fa-bullhorn',
		preset: true,
	},
];

export default Roles;
