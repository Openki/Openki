
Template.show_categories.loadcategories = function(categories) {
	return Categories.find({_id: {$in: categories}})
}
