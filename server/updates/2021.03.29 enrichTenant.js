import { Meteor } from 'meteor/meteor';
import { Tenants } from '/imports/api/tenants/tenants';
import { Regions } from '/imports/api/regions/regions';
import { Courses } from '/imports/api/courses/courses';
import Events from '/imports/api/events/events';
import { Users } from '/imports/api/users/users';

function update() {
	let updated = 0;

	const tenantId = Tenants.insert({
		name: Meteor.settings.public.siteName,
		members: [],
	});

	updated += 1;

	Regions.find().fetch().forEach((orginalRegion) => {
		const region = { ...orginalRegion };
		region.tenant = tenantId;
		updated += Regions.update(region._id, region);
	});

	Courses.find().fetch().forEach((orginalCourse) => {
		const course = { ...orginalCourse };
		course.tenant = tenantId;
		updated += Courses.update(course._id, course);
	});

	Events.find().fetch().forEach((orginalEvent) => {
		const event = { ...orginalEvent };
		event.tenant = tenantId;
		updated += Events.update(event._id, event);
	});

	Users.find().fetch().forEach((orginalUser) => {
		const user = { ...orginalUser };
		user.tenants = [];
		updated += Users.update(user._id, user);
	});

	return updated;
}

export { update as default, update };
