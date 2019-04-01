import Courses from '/imports/api/courses/courses.js';

// To compress all sitemap as gzip file
sitemaps.config('gzip', true);

sitemaps.add('/sitemap.xml', function(req) {

	let out = [];
	const courses = Courses.find({}, { sort: {time_lastedit: -1}, limit: 2000});

	courses.forEach((course) => {
		out.push({
			page: 'course/' + course._id + '/' + course.slug,
			lastmod: course.time_lastedit
		});
	});
	return out;
});
