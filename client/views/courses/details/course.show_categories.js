Template.show_categories.loadcategories = function(categories) {
	if (!categories) return []; // IGNORANCE IS STRENGTH
	var allSubCats = Categories.find({_id: {$in: categories}, parent: {$gte:1}});
	var subCatParents = []
	var count = 0;
	allSubCats.forEach(function (subCat) {
		subCatParents.push(subCat.parent)
	})
	//returns all categories, without parents of subcategories.
	return Categories.find({_id: {$in: categories, $nin: subCatParents}}).fetch();
}
