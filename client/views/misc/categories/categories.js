"use strict";

var categories_helper = function () {
	return Categories.find();
};

Template.categorylist.helpers({
	categories: categories_helper
});

Template.category.helpers({
	courses_by_category: function () {
		var courses_by_category = Courses.find({categories: this._id});
		return courses_by_category;
	}
});

Template.showCategories.events({
	"click .js-category-label": function(event, template){
		template.$("[data-toggle='tooltip']").tooltip('hide');
	}
});

Template.showCategories.rendered = function() {
	this.$("[data-toggle='tooltip']").tooltip();
};
