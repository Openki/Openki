import { Courses } from '/imports/api/courses/courses';

export function update() {
	let updated = 0;

	Courses.find({ archived: { $exists: false } }).fetch().forEach((orginalCourse) => {
		const course = { ...orginalCourse };
		course.archived = false;
		updated += Courses.update(course._id, course);
	});

	return updated;
}

export default update;
