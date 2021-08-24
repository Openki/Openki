import { Regions } from '/imports/api/regions/regions';
// eslint-disable-next-line import/no-cycle
import { CourseEntity, Courses } from '/imports/api/courses/courses';

// Based on the guide from meteor: https://guide.meteor.com/collections.html#abstracting-denormalizers

export function onStartUp() {
	let updated = 0;

	Regions.find({}, { fields: { _id: 1, tenant: 1 } }).forEach((region) => {
		updated += Courses.update(
			{ region: region._id },
			{ $set: { tenant: region.tenant } },
			{ multi: true },
		);
	});

	/* eslint-disable-next-line no-console */
	console.log(`courses.tenantDenormalizer.onStartUp: ${updated} affected courses`);
}

export function beforeInsert(course: Mongo.OptionalId<CourseEntity>) {
	if (!course.region) {
		throw new Error('Unexpected falsy: course.region');
	}

	const region = Regions.findOne(course.region);

	if (!region) {
		throw new Error(`None matching region found for ${course.region}`);
	}

	return { ...course, tenant: region.tenant };
}
