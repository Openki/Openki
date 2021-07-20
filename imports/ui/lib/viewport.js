import { Session } from 'meteor/session';

export function update() {
	const viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

	Session.set('viewportWidth', viewportWidth);
}

export function get() {
	if (Session.get('viewportWidth') === undefined) {
		update();
	}

	return { width: Session.get('viewportWidth') };
}
