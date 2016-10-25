Template.categoriesMenu.helpers({
	categoriesCount: function() {
		return Categories.length;
	},

	categories: function() {
		return Categories;
	},

	categoryIdentifier: function() {
		return Categories.indexOf(this) + 1;
	},

	activeCategory: function() {
		var findInstance = Template.instance().parentInstance();
		var selectedCategories = findInstance.filter.get('categories');
		if (selectedCategories && ~selectedCategories.indexOf(this.name)) {
			return 'active';
		}
	}
});

Template.categoriesMenu.events({
	"click .js-menu-category": function(e, instance){
		var categoryName = this.name;

		var findInstance = instance.parentInstance();
		var filter = findInstance.filter;

		var selectedCategories = filter.get('categories');
		var categoryIsSelected = selectedCategories && ~selectedCategories.indexOf(categoryName);

		if (categoryIsSelected) {
			filter.remove('categories', categoryName).done();
		} else {
			filter.clear();
			filter.add('categories', categoryName).done();
		}

		updateCategorySearch(e, findInstance);
		updateUrl(e, findInstance);
		window.scrollTo(0, 0);
	}
});
