import { Courses } from '/imports/api/courses/courses';
import { Events, EventEntity } from '/imports/api/events/events';

export function beforeInsert(event: EventEntity): EventEntity {
	if (!event.courseId) {
		return event;
	}

	const course = Courses.findOne(event.courseId);
	if (!course) {
		throw new Error(`Missing course ${event.courseId} for event ${event._id}`);
	}

	return { ...event, courseImage: course.image };
}

export function afterCourseUpdateImage(courseId: string, image: string) {
	Events.update({ courseId }, { $set: { courseImage: image } }, { multi: true });
}

export function afterCourseDeleteImage(courseId: string) {
	Events.update({ courseId }, { $set: { courseImage: '' } }, { multi: true });
}
