import { Courses } from './courses';

export function afterUpdate(courseId: string, userId: string) {
	Courses.update(courseId, {
		$addToSet: {
			history: {
				dateTime: new Date(),
				type: 'updated',
				data: { updatedBy: userId },
			} as any,
		},
	});
}

export function afterSubscribe(courseId: string, userId: string, roleType: string) {
	Courses.update(courseId, {
		$addToSet: {
			history: {
				dateTime: new Date(),
				type: 'userSubscribed',
				data: { user: userId, role: roleType },
			} as any,
		},
	});
}

export function afterUnsubscribe(courseId: string, userId: string, roleType: string) {
	Courses.update(courseId, {
		$addToSet: {
			history: {
				dateTime: new Date(),
				type: 'userUnsubscribed',
				data: { user: userId, role: roleType },
			} as any,
		},
	});
}

export function afterEventInsert(
	courseId: string,
	userId: string,
	event: {
		_id: string;
		title: string;
		slug: string;
		startLocal: string;
	},
) {
	Courses.update(courseId, {
		$addToSet: {
			history: {
				dateTime: new Date(),
				type: 'eventInserted',
				data: { createdBy: userId, ...event },
			} as any,
		},
	});
}

export function afterEventUpdate(
	courseId: string,
	userId: string,
	event: {
		_id: string;
		title: string;
		slug: string;
		startLocal: string;
		replicasUpdated: boolean;
	},
) {
	Courses.update(courseId, {
		$addToSet: {
			history: {
				dateTime: new Date(),
				type: 'eventUpdated',
				data: { updatedBy: userId, ...event },
			} as any,
		},
	});
}

export function afterEventRemove(
	courseId: string,
	userId: string,
	event: {
		title: string;
		startLocal: string;
	},
) {
	Courses.update(courseId, {
		$addToSet: {
			history: {
				dateTime: new Date(),
				type: 'eventRemoved',
				data: { removedBy: userId, ...event },
			} as any,
		},
	});
}
