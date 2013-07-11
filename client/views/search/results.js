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
		})
	}
	var courses = Courses.find(find)
	return { count: courses.count(), courses: courses }
}
