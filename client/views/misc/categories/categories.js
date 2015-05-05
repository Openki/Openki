"use strict";

var categories_helper = function () {
	return Categories.find();
}

Template.categorylist.helpers({
	categories: categories_helper
})

Template.category.helpers({
	courses_by_category: function () {
		var courses_by_category = Courses.find({categories: this._id});
		return courses_by_category;
	}
})


Template.course_category.events({
	'click input.add': function () {
		if (pleaseLogin()) return;
		if ($("#addform_name").val()==""){
			// wenn kein kurs name angegeben ist, warne und poste nichts in db
			alert("Please write something and think twice");
		}else{
			// sonst poste in db und cleare die inputfelder
			Categories.insert({name: $("#addform_name").val(), time_created: get_timestamp(), time_changed: get_timestamp(), createdby:Meteor.userId()});
			$("#addform_name").val("");
		}
	}
});


Template.show_categories.helpers({
	'loadcategories': function(categories) {
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
});
