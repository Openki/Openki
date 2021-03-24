import Regions from '/imports/api/regions/regions';
/** @typedef {import('/imports/api/courses/courses').CourseModel} CourseModel */

export default {
	/**
     * @param {CourseModel} course
     */
	beforeInsert(course) {
		if (!course.region) {
			throw new Error('Unexpected falsy: course.region');
		}

		const region = Regions.findOne(course.region);

		if (!region) {
			throw new Error(`None matching region found for ${course.region}`);
		}

		return { ...course, tenant: region.tenant };
	},
};
