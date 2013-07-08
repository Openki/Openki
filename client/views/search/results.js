Template.search_results.results = function () {
	var query = Session.get('search')
	var courses = Courses.find()
	if (!!query) {
		courses = Courses.find({
			$or: [
				// FIXME: Runs unescaped as regex, absolutely not ok
				// ALSO: Not user friendly, do we can have fulltext?
				{ name: { $regex: query, $options: 'i' } },
				{ description: { $regex: query, $options: 'i' } }
			]
		})
	}
	return { count: courses.count(), courses: courses }
}
