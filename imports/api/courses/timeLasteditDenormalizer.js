import { Courses } from './courses';
/** @typedef {import('/imports/api/courses/courses').CourseEntity} CourseEntity */

// Based on the guide from meteor: https://guide.meteor.com/collections.html#abstracting-denormalizers

/**
 * Enrich the course entity with the modification date
 * @param {CourseEntity} course
 */
export function beforeInsert(course) {
	return { ...course, time_lastedit: new Date() };
}

/**
 * Enrich the course entity with the modification date
 * @param {CourseEntity} course
 */
export function beforeUpdate(course) {
	return { ...course, time_lastedit: new Date() };
}

/**
 * Update the modification date
 * @param {string} courseId
 */
export function afterSubscribe(courseId) {
	Courses.update(courseId, { $set: { time_lastedit: new Date() } });
}

/**
 * Update the modification date
 * @param {string} courseId
 */
export function afterUnsubscribe(courseId) {
	Courses.update(courseId, { $set: { time_lastedit: new Date() } });
}

/**
 * Update the modification date of the course
 * @param {string} courseId
 */
export function afterEventInsert(courseId) {
	Courses.update(courseId, { $set: { time_lastedit: new Date() } });
}
