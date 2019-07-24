import Courses from '/imports/api/courses/courses';

// To compress all sitemap as gzip file
sitemaps.config('gzip', true);

sitemaps.add('/sitemap.xml', () => {
	const out = [];
	const courses = Courses.find({}, { sort: { time_lastedit: -1 }, limit: 2000 });

	courses.forEach((course) => {
		out.push({
			page: Router.url('showCourse', course),
			lastmod: course.time_lastedit,
		});
	});
	return out;
});
