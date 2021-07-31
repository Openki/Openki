import { ReactiveVar } from 'meteor/reactive-var';

function getNowWithoutSeconds() {
	const now = new Date();

	now.setSeconds(0);
	now.setMilliseconds(0);

	return now;
}

/**
 * A reactive store that can be used for updates based on time. It contains just full minutes. It
 * changed all minutes (with an accuracy of +-5 seconds).
 */
export const reactiveNow = new ReactiveVar(getNowWithoutSeconds());

// Check for update all 5 seconds
Meteor.setInterval(() => {
	const now = getNowWithoutSeconds();
	const old = reactiveNow.get();
	if (old.getTime() !== now.getTime()) {
		reactiveNow.set(now);
	}
}, 1000 * 5);

export default reactiveNow;
