import { sitemaps } from 'meteor/gadicohen:sitemaps';
import { Router } from 'meteor/iron:router';

import { Courses } from '/imports/api/courses/courses';
import { Events } from '/imports/api/events/events';
// import { Venues } from '/imports/api/venues/venues';
// import { Groups } from '/imports/api/groups/groups';
import { visibleTenants } from '/imports/utils/visible-tenants';

// To compress all sitemap as gzip file
sitemaps.config('gzip', true);

sitemaps.add('/sitemap.xml', () => {
	const out: { page: string; lastmod: Date }[] = [];
	const courses = Courses.findFilter({ tenants: visibleTenants(), internal: false });
	const events = Events.findFilter({ });
	// const venues = Venues.findFilter({ });
	// const groups = Groups.findFilter({ });

	courses.forEach((course) => {
		out.push({
			page: Router.url('showCourse', course),
			lastmod: course.time_lastedit,
		});
	});
	events.forEach((event) => {
		out.push({
			page: Router.url('showEvent', event),
			lastmod: event.time_lastedit,
		});
	});
	// venues.forEach((venue) => {
	// 	out.push({
	// 		page: Router.url('showVenue', venue),
	// 		// lastmod: venue.time_lastedit,
	// 	});
	// });
	// groups.forEach((group) => {
	// 	out.push({
	// 		page: Router.url('showGroup', group),
	// 		// lastmod: group.time_lastedit,
	// 	});
	// });
	return out;
});
