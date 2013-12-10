Template.search_results.results = function () {
	var region = Session.get('region')
	var query = Session.get('search')
	var find = {}
	if (!!region) find.region = region
	if (!!query) {
		_.extend(find, {
			$or: [
				// FIXME: Runs unescaped as regex, absolutely not ok
				// ALSO: Not user friendly, do we can have fulltext?
				{ name: { $regex: query, $options: 'i' } },
				{ description: { $regex: query, $options: 'i' } }
			]
				//{sort: {time_created: -1}} ??
		})
	}



	

	var courses = Courses.find(find)
	var regionObj = Regions.findOne(region)
	var regionName = regionObj ? regionObj.name : 'All regions'
    var coursesTotal = Courses.find().count();
    if (regionName !== "All regions") {
        coursesTotal = Courses.find({region: find.region}).count();
    }
	return { count: courses.count(), countTotal: coursesTotal, courses: courses, region : regionName }
}

Template.search_results.coursesLoaded = function () {
	return Session.get('coursesLoaded');
};

