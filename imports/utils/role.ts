import { Roles } from '../api/roles/roles';

export function roleIcon(type: string) {
	if (!type) {
		return '';
	}

	return Roles.find((r) => r.type === type)?.icon || '';
}
