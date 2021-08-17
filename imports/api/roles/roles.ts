/** DB-Model */
interface RoleEntity {
	/** (name of role) */
	type: string;
	/** ex: "fa fa-bullhorn" */
	icon: string;
	/** For always-on roles */
	preset?: boolean;
}

export const Roles: RoleEntity[] = [
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
