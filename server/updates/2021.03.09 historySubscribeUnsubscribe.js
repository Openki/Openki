
import { Courses } from '/imports/api/courses/courses';

function update() {
	let updated = 0;

	Log.find({ tr: 'Courses.Subscribe' }).fetch().forEach((entry) => {
		const { courseId, userId, role } = entry.body;

		Courses.update(courseId, {
			$addToSet: {
				history: {
					dateTime: entry.ts, type: 'userSubscribed', data: { user: userId, role },
				},
			},
		});
		updated += 1;
	});

	Log.find({ tr: 'Courses.Unsubscribe' }).fetch().forEach((entry) => {
		const { courseId, userId, role } = entry.body;

		Courses.update(courseId, {
			$addToSet: {
				history: {
					dateTime: entry.ts, type: 'userUnsubscribed', data: { user: userId, role },
				},
			},
		});
		updated += 1;
	});

	return updated;
}

export { update as default, update };
