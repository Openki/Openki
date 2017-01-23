Template.filter.events({
	'change .js-toggle-property-filter': function(event, instance) {
		var parentInstance = instance.parentInstance();

		parentInstance.filter.add('upcomingEvent', instance.$('#hasUpcomingEvent').prop('checked'));
		parentInstance.filter.add('needsHost', instance.$('#needsHost').prop('checked'));
		parentInstance.filter.add('needsMentor', instance.$('#needsMentor').prop('checked'));
		parentInstance.filter.done();
		updateUrl(event, parentInstance);
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
		_.debounce(updateCategorySearch(event, instance, parentInstance), 100);
	},

	'focus .js-search-categories': function(event, instance) {
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
		var parentInstance = instance.parentInstance();
		var category = this;

		parentInstance.filter.add('categories', "" + category).done();
		instance.$('.js-search-categories').val('');
		updateCategorySearch(event, instance, parentInstance);
		updateUrl(event, parentInstance);
		window.scrollTo(0, 0);
	},

	'click .js-remove-category-btn': function(event, instance) {
		var parentInstance = instance.parentInstance();
		var category = this;

		parentInstance.filter.remove('categories', '' + category).done();
		updateUrl(event, parentInstance);
		return false;
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
});
