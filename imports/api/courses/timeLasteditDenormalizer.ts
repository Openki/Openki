import { CourseEntity, Courses } from './courses';

// Based on the guide from meteor: https://guide.meteor.com/collections.html#abstracting-denormalizers

/**
 * Enrich the course entity with the modification date
 */
export function beforeInsert(course: Mongo.OptionalId<CourseEntity>) {
	return { ...course, time_lastedit: new Date() };
}

/**
 * Enrich the course entity with the modification date
 */
export function beforeUpdate(course: Mongo.OptionalId<CourseEntity>) {
	return { ...course, time_lastedit: new Date() };
}

/**
 * Enrich the course entity with the modification date
 */
export function beforeUpdateImage(update: { image: string }) {
	return { ...update, time_lastedit: new Date() };
}

/**
 * Enrich the course entity with the modification date
 */
export function beforeDeleteImage() {
	return { time_lastedit: new Date() };
}

/**
 * Update the modification date
 */
export function afterSubscribe(courseId: string) {
	Courses.update(courseId, { $set: { time_lastedit: new Date() } });
}

/**
 * Update the modification date
 */
export function afterUnsubscribe(courseId: string) {
	Courses.update(courseId, { $set: { time_lastedit: new Date() } });
}

/**
 * Update the modification date of the course
 */
export function afterEventInsert(courseId: string) {
	Courses.update(courseId, { $set: { time_lastedit: new Date() } });
}
