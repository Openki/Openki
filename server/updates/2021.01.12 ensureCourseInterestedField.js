import { Courses } from '/imports/api/courses/courses';

export default function update() {
	let updated = 0;

	Courses.find({ interested: { $exists: false } }).fetch().forEach((orginalCourse) => {
		const course = { ...orginalCourse };
		course.interested = course.members?.length || 0;
		updated += Courses.update(course._id, course);
	});

	return updated;
}
