/** DB-Model */
export interface RoleEntity {
	/** (name of role) */
	type: string;
	/** ex: "fa-solid fa-bullhorn" */
	icon: string;
	/** For always-on roles */
	preset?: boolean;
}

export const Roles: RoleEntity[] = [
	{
		type: 'participant',
		icon: 'fa-solid fa-user',
		preset: true,
	},
	{
		type: 'mentor',
		icon: 'fa-solid fa-graduation-cap',
	},
	{
		type: 'host',
		icon: 'fa-solid fa-house',
	},
	{
		type: 'team',
		icon: 'fa-solid fa-bullhorn',
		preset: true,
	},
];
