
Template.show_categories.loadcategories = function(categories) {
	//return Categories.find({_id: {$in: categories}});
	
	var allSubCats = Categories.find({_id: {$in: categories}, parent: {$gte:1}});
	var subCatParents = new Array();
	var count = 0;
	
	allSubCats.forEach(function (subCat) {
	  subCatParents[count] = subCat.parent;
      count += 1;
    }); 
    
    //returns all categories, without parents of subcategories.
	return Categories.find({_id: {$in: categories, $nin: subCatParents}});
	
}
