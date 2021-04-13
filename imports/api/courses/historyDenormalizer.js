import { Courses } from './courses';

/**
 * @param {string} courseId
 * @param {string} userId
 */
function afterUpdate(courseId, userId) {
	Courses.update(courseId, {
		$addToSet: {
			history: {
				dateTime: new Date(), type: 'updated', data: { updatedBy: userId },
			},
		},
	});
}

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
 * @param {string} userId
 * @param {{
	_id: string;
	title: string;
	slug: string;
	startLocal: string;
}} event
 */
function afterEventInsert(courseId, userId, event) {
	Courses.update(courseId, {
		$addToSet: {
			history: {
				dateTime: new Date(), type: 'eventInserted', data: { createdBy: userId, ...event },
			},
		},
	});
}

/**
 * @param {string} courseId
 * @param {string} userId
 * @param {{
 * _id: string;
 * title: string;
 * slug: string;
 * startLocal: string;
 * replicasUpdated: boolean;
 * }} event
 */
function afterEventUpdate(courseId, userId, event) {
	Courses.update(courseId, {
		$addToSet: {
			history: {
				dateTime: new Date(), type: 'eventUpdated', data: { updatedBy: userId, ...event },
			},
		},
	});
}

/**
 * @param {string} courseId
 * @param {string} userId
 * @param {{
	title: string;
	startLocal: string;
}} event
 */
function afterEventRemove(courseId, userId, event) {
	Courses.update(courseId, {
		$addToSet: {
			history: {
				dateTime: new Date(), type: 'eventRemoved', data: { removedBy: userId, ...event },
			},
		},
	});
}

export {
	afterUpdate,
	afterSubscribe,
	afterUnsubscribe,
	afterEventInsert,
	afterEventUpdate,
	afterEventRemove,
};
