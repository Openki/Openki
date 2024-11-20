import { Mongo } from "meteor/mongo";
import { CourseEntity, Courses } from "./courses";

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
export function beforeUpdateImage(update: { image: string; compactImage: string }) {
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
export async function afterSubscribe(courseId: string) {
  await Courses.updateAsync(courseId, { $set: { time_lastedit: new Date() } });
}

/**
 * Update the modification date
 */
export async function afterUnsubscribe(courseId: string) {
  await Courses.updateAsync(courseId, { $set: { time_lastedit: new Date() } });
}

/**
 * Update the modification date of the course
 */
export async function afterEventInsert(courseId: string) {
  await Courses.updateAsync(courseId, { $set: { time_lastedit: new Date() } });
}
