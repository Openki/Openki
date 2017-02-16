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
	"click .js-menu-category": function(event, instance) {
		var categoryName = this.name;
		var parentInstance = instance.parentInstance();
		var filter = parentInstance.filter;
		var selectedCategories = filter.get('categories');
		var categoryIsSelected = selectedCategories && ~selectedCategories.indexOf(categoryName);

		if (categoryIsSelected) {
			filter.remove('categories', categoryName).done();
		} else if (event.ctrlKey) {
			filter.add('categories', categoryName).done();
		} else {
			filter.clear();
			filter.add('categories', categoryName).done();
		}

		parentInstance.updateCategorySearch('');
		parentInstance.updateUrl();
		window.scrollTo(0, 0);
	}
});
