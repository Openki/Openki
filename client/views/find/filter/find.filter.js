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

	'mouseover .js-filter-upcoming-events, mouseout .js-filter-upcoming-events': function(e) {
		var activate = e.type == 'mouseover';
		var previewOptions = {
			selector: '.has-upcoming-events',
			activate: activate
		};
		courseFilterPreview(previewOptions);
	},

	'mouseover .js-filter-needs-host, mouseout .js-filter-needs-host': function(e) {
		var activate = e.type == 'mouseover';
		var previewOptions = {
			selector: '.needs-host',
			activate: activate
		};
		courseFilterPreview(previewOptions);
	},

	'mouseover .js-filter-needs-mentor, mouseout .js-filter-needs-mentor': function(e) {
		var activate = e.type == 'mouseover';
		var previewOptions = {
			selector: '.needs-mentor',
			activate: activate
		};
		courseFilterPreview(previewOptions);
	},

	'mouseover .js-category-selection-label, mouseout .js-category-selection-label': function(e) {
		var category = this;
		var activate = e.type == 'mouseover';
		var previewOptions = {
			selector: ('.category-' + category),
			activate: activate
		};
		courseFilterPreview(previewOptions);

		$('.js-category-label.category-' + category)
			.parent()
			.toggleClass('highlight');
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
	},
});


Template.filter.helpers({
	'toggleChecked': function(name) {
		var parentInstance = Template.instance().parentInstance();
		return parentInstance.filter.get(name) ? 'checked' : '';
	},

	'categories': function() {
		var parentInstance = Template.instance().parentInstance();
		return parentInstance.filter.get('categories');
	},

	'availableCategories': function() {
		var parentInstance = Template.instance().parentInstance();
		return Object.keys(parentInstance.categorySearchResults.get('categorySearchResults'));
	},

	'availableSubcategories': function(mainCategory) {
		var parentInstance = Template.instance().parentInstance();
		return parentInstance.categorySearchResults.get()[mainCategory];
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

	instance.$('.filter-categories-select').on('show.bs.dropdown hide.bs.dropdown', function(e) {
		var dropdownMenu = $(e.target).find('.dropdown-menu').first();

		dropdownMenu.stop(true, true).slideToggle(200);
		instance.$('.dropdown-toggle').fadeToggle(200);
	});

	instance.$('.filter-categories-select').on('shown.bs.dropdown', function(e) {
		instance.$('.js-search-categories').select();
	});
});
