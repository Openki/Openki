import { Mongo } from 'meteor/mongo';

import { CourseEntity, Courses } from './courses';

function update(courseId: string) {
	const course = Courses.findOne(courseId);

	if (!course) {
		return;
	}

	Courses.update({ _id: course._id }, { $set: { interested: course.members?.length || 0 } });
}
async function updateAsync(courseId: string) {
	const course = await Courses.findOneAsync(courseId);

	if (!course) {
		return;
	}

	await Courses.updateAsync(
		{ _id: course._id },
		{ $set: { interested: course.members?.length || 0 } },
	);
}

export function beforeInsert(course: Mongo.OptionalId<CourseEntity>) {
	return { ...course, interested: course.members.length };
}

export function afterSubscribe(courseId: string) {
	update(courseId);
}

export function afterUnsubscribe(courseId: string) {
	update(courseId);
}

export async function afterUserAdminRemove(courseId: string) {
	await updateAsync(courseId);
}
