import Courses from './courses';

/** @typedef {import('../events/events').EventEntity} EventEntity */

/**
 * @param {string} courseId
 * @param {string} userId
 * @param {string} roleType
 */
function afterSubscribe(courseId, userId, roleType) {
	Courses.update(courseId, {
		$addToSet: {
			history: {
				dateTime: new Date(), type: 'userSubscribed', data: { user: userId, role: roleType },
			},
		},
	});
}

/**
 * @param {string} courseId
 * @param {string} userId
 * @param {string} roleType
 */
function afterUnsubscribe(courseId, userId, roleType) {
	Courses.update(courseId, {
		$addToSet: {
			history: { dateTime: new Date(), type: 'userUnsubscribed', data: { user: userId, role: roleType } },
		},
	});
}

/**
 * @param {EventEntity} event
 */
function afterEventInsert(event) {
	Courses.update(event.courseId, {
		$addToSet: {
			history: { dateTime: new Date(), type: 'eventInserted', data: event },
		},
	});
}

export { afterSubscribe, afterUnsubscribe, afterEventInsert };


