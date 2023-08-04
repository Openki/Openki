import { sitemaps } from 'meteor/gadicohen:sitemaps';
import { Router } from 'meteor/iron:router';

import { Courses } from '/imports/api/courses/courses';
import { Events } from '/imports/api/events/events';
import { Venues } from '/imports/api/venues/venues';
import { Groups } from '/imports/api/groups/groups';
import { visibleTenants } from '/imports/utils/visible-tenants';

// To compress all sitemap as gzip file
sitemaps.config('gzip', true);

sitemaps.add('/sitemap.xml', () => {
	const out: object[] = [];
	const courses = Courses.findFilter({ tenants: visibleTenants(), internal: false });
	const events = Events.findFilter({ tenants: visibleTenants(), internal: false });
	const venues = Venues.find();
	const groups = Groups.find();

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
	venues.forEach((venue) => {
		out.push({
			page: Router.url('venueDetails', venue),
			lastmod: venue.updated,
		});
	});

	groups.forEach((group) => {
		out.push({
			page: Router.url('groupDetails', group),
		});
	});
       return out;
});
