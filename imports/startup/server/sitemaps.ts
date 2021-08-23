import { sitemaps } from 'meteor/gadicohen:sitemaps';
import { Router } from 'meteor/iron:router';

import { Courses } from '/imports/api/courses/courses';
import visibleTenants from '/imports/utils/visible-tenants';

// To compress all sitemap as gzip file
sitemaps.config('gzip', true);

sitemaps.add('/sitemap.xml', () => {
	const out: { page: string; lastmod: Date }[] = [];
	const courses = Courses.findFilter({ tenants: visibleTenants(), internal: false });

	courses.forEach((course) => {
		out.push({
			page: Router.url('showCourse', course),
			lastmod: course.time_lastedit,
		});
	});
	return out;
});
