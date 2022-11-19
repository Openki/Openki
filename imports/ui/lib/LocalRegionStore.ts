import { Session } from 'meteor/session';

export function set(region: string) {
	try {
		localStorage.setItem('region', region); // to survive page reload
	} catch {
		// ignore See: https://developer.mozilla.org/en-US/docs/Web/API/Storage/setItem#exceptions
	}
	Session.set('region', region);
}

export function equals(region: string) {
	return Session.equals('region', region);
}

export function get() {
	return Session.get('region') as string;
}

/**
 * Use undefined instead of 'all' to mean "All regions".
 * This is needed until all instances where we deal with regions are patched.
 */
export function getCleaned() {
	const region = get();
	return region === 'all' ? undefined : region;
}

export function reset() {
	set('all');
}
