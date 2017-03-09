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

Template.categoriesMenu.onRendered(function() {
	var instance = this;
	var lastPosition = 0;
	var scrollingUp = false;
	var turningPoint;

	$(window).scroll(function() {
		var position = $(window).scrollTop();
		var categoriesMenu = instance.$('.categories-menu');

		// hide submenu when scrolling down
		if (position > lastPosition) {
			scrollingUp = false;
			categoriesMenu.slideUp(300);
		} else {
			// store position of when changing scrolling direction
			if (!scrollingUp) {
				turningPoint = position;
				scrollingUp = true;
			} else {
				// and use it as a reference point to allow some distance
				// being scrolled up before the menu slides down again
				var tolerance = 200;
				if (turningPoint - position >= tolerance) {
					categoriesMenu.slideDown(300);
				}
			}
		}

		lastPosition = position;
	});
});
