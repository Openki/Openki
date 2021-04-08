import { Courses } from './courses';

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
			history: {
				dateTime: new Date(), type: 'userUnsubscribed', data: { user: userId, role: roleType },
			},
		},
	});
}

/**
 * @param {string} courseId
 * @param {{
	_id: string;
	title: string;
	slug: string;
	startLocal: string;
	createdBy: string;
}} event
 */
function afterEventInsert(courseId, event) {
	Courses.update(courseId, {
		$addToSet: {
			history: {
				dateTime: new Date(), type: 'eventInserted', data: event,
			},
		},
	});
}

/**
 * @param {string} courseId
 * @param {{
	title: string;
	startLocal: string;
	createdBy: string;
}} event
 */
function afterEventRemove(courseId, event) {
	Courses.update(courseId, {
		$addToSet: {
			history: {
				dateTime: new Date(), type: 'eventRemoved', data: event,
			},
		},
	});
}

export {
	afterSubscribe, afterUnsubscribe, afterEventInsert, afterEventRemove,
};
