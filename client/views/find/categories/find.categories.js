Template.categoriesMenu.helpers({
	categoriesCount: function() {
		return Categories.length;
	},

	categories: function() {
		return Categories;
	},

	categoryIndex: function() {
		return Categories.indexOf(this);
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

		updateUrl(e, findInstance);
	}
});
