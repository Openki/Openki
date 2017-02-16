Template.filter.events({
	'change .js-toggle-property-filter': function(event, instance) {
		event.preventDefault();

		var parentInstance = instance.parentInstance();

		parentInstance.filter.add('upcomingEvent', instance.$('#hasUpcomingEvent').prop('checked'));
		parentInstance.filter.add('needsHost', instance.$('#needsHost').prop('checked'));
		parentInstance.filter.add('needsMentor', instance.$('#needsMentor').prop('checked'));
		parentInstance.filter.done();

		parentInstance.updateUrl();
	},


	'mouseover .js-category-selection-label': function() {
		var category = this;
		courseFilterPreview(('.' + category), true);
	},

	'mouseout .js-category-selection-label': function() {
		var category = this;
		courseFilterPreview(('.' + category), false);
	},

	'keyup .js-search-categories': function(event, instance) {
		var parentInstance = instance.parentInstance();
		var query = instance.$('.js-search-categories').val();

		parentInstance.updateCategorySearchDebounced(query);
	},

	'click .js-search-categories': function(event, instance) {
		instance.$('.dropdown-toggle').dropdown('toggle');
	},

	'click .js-toggle-subcategories': function(event, instance) {
		var category = this;

		instance.$(".js-sub-category" + "." + category).toggle();
		instance.$(".js-toggle-subcategories." + category + " span")
		        .toggleClass('fa-angle-down fa-angle-up');
		event.stopPropagation();
	},

	'click .js-category-selection-label': function(event, instance) {
		event.preventDefault();
		var parentInstance = instance.parentInstance();

		// Add to filter
		var category = this; // Event context is the category id
		parentInstance.filter.add('categories', "" + category).done();

		// Clear search field
		instance.$('.js-search-categories').val('');

		parentInstance.updateCategorySearch('');
		parentInstance.updateUrl();

		window.scrollTo(0, 0);
	},

	'click .js-remove-category-btn': function(event, instance) {
		var parentInstance = instance.parentInstance();
		var category = this;

		parentInstance.filter.remove('categories', '' + category).done();
		parentInstance.updateUrl();
		$('#find').select();
	}
});


Template.filter.helpers({
	'toggleChecked': function(name) {
		var parentInstance = Template.instance().parentInstance();
		return parentInstance.filter.get(name) ? 'checked' : '';
	},

	'selectedCategories': function() {
		var parentInstance = Template.instance().parentInstance();
		return parentInstance.filter.get('categories');
	},

	'availableCategories': function() {
		var parentInstance = Template.instance().parentInstance();
		return Object.keys(parentInstance.categorySearchResults.get());
	},

	'availableSubcategories': function(mainCategory) {
		var parentInstance = Template.instance().parentInstance();
		return parentInstance.categorySearchResults.get()[mainCategory];
	},

	isInFilter: function() {
		var filterCategories = Template.instance().filter.get('categories');
		var categoryName = ''+this;
		return _.contains(filterCategories, categoryName);
	},

	categoryIdentifier: function() {
		var categoryName = ''+this;
		var mainCategory = _.find(Categories, function(category) {
			return category.name === categoryName;
		});
		return mainCategory._id;
	},

	'icon': function() {
		var categoryName = this;
		var category = _.find(Categories, function(category) {
			return category.name == categoryName;
		});
		if (category) return category.icon;
	},

	'categoryNameMarked': function() {
		Session.get('locale'); // Reactive dependency
		var parentInstance = Template.instance().parentInstance();
		var search = parentInstance.categorySearch.get();
		var name = mf('category.'+this);
		return markedName(search, name);
	},

	'isMobile': function() {
		var screenXS = SCSSVars.screenXS;
		return Session.get('viewportWidth') <= screenXS;
	}
});

Template.filter.onRendered(function() {
	var instance = this;

	instance.$('.js-filter-upcoming-events').on('mouseover mouseout', function(e) {
		var activate = e.type == 'mouseover';
		courseFilterPreview('.has-upcoming-events', activate);
	});

	instance.$('.js-filter-needs-host').on('mouseover mouseout', function(e) {
		var activate = e.type == 'mouseover';
		courseFilterPreview('.needsHost', activate);
	});

	instance.$('.js-filter-needs-mentor').on('mouseover mouseout', function(e) {
		var activate = e.type == 'mouseover';
		courseFilterPreview('.needsMentor', activate);
	});

	instance.$('.filter-categories-select').on('show.bs.dropdown hide.bs.dropdown', function(e) {
		var dropdownMenu = $(e.target).find('.dropdown-menu').first();

		dropdownMenu.stop(true, true).slideToggle(200);
		instance.$('.dropdown-toggle').fadeToggle(200);
	});

	instance.$('.filter-categories-select').on('shown.bs.dropdown', function(e) {
		instance.$('.js-search-categories').select();
	});
});
