Template.captionsFilter.onCreated(function() {
	const instance = this;

	console.log(instance);

	instance.showAllFilters = new ReactiveVar(true);

	instance.stateFilters = [
		{
			cssClass: 'is-proposal',
			name: 'proposal',
			label: mf('filterCaptions.proposal', 'Proposal'),
			title: mf('filterCaptions.showProposal', 'Show all proposed courses')
		},
		{
			cssClass: 'has-upcoming-events',
			name: 'upcomingEvent',
			label: mf('filterCaptions.upcoming.label', 'Upcoming'),
			title: mf('filterCaptions.upcoming.title', 'Show all courses with upcoming events')
		},
		{
			cssClass: 'has-past-events',
			name: 'pastEvent',
			label: mf('filterCaptions.passed.label', 'Passed'),
			title: mf('filterCaptions.passed.title', 'Show all courses with passed events')
		},
	];

	const roleFilters = [
		{
			name: 'team',
			label: mf('find.needsOrganizer', 'Looking for an organizer')
		},
		{
			name: 'mentor',
			label: mf('find.needsMentor', 'Looking for a mentor')
		},
		{
			name: 'host',
			label: mf('find.needsHost', 'Looking for a host')
		}
	];

	roleFilters.forEach(roleFilter => {
		const icon = _.findWhere(Roles, { type: roleFilter.name } ).icon;
		roleFilter.icon = icon;
	});

	instance.roleFilters = roleFilters;
});

Template.captionsFilter.onRendered(function() {
	const instance = this;
	const catSelect = instance.$('.filter-categories-select');

	catSelect.on('show.bs.dropdown hide.bs.dropdown', () => {
		instance.$('.dropdown-toggle').fadeToggle(200);
	});

	catSelect.on('shown.bs.dropdown', () => {
		instance.$('.js-search-categories').select();
	});
});

Template.captionsFilter.helpers({
	stateFilters() {
		return Template.instance().stateFilters;
	},

	stateFilterClasses(stateFilter) {
		const classes = [];
		const instance = Template.instance();
		const parentInstance = instance.parentInstance();

		classes.push(stateFilter.cssClass);

		if (parentInstance.filter.get('state') == stateFilter.name) {
			classes.push('active');
		}

		return classes.join(' ');
	},

	showAllFilters() {
		return Template.instance().showAllFilters.get();
	},

	roleFilters() {
		return Template.instance().roleFilters;
	},

	roleFilterClasses(roleFilter) {
		const classes = [];
		const instance = Template.instance();
		const parentInstance = instance.parentInstance();

		if (parentInstance.filter.get('needsRole') && parentInstance.filter.get('needsRole').indexOf(roleFilter.name) >= 0) {
			classes.push('active');
		}

		return classes.join(' ');
	},

	toggleChecked(name) {
		const parentInstance = Template.instance().parentInstance();
		return parentInstance.filter.get(name) ? 'checked' : '';
	},

	categories() {
		const parentInstance = Template.instance().parentInstance();
		return parentInstance.filter.get('categories');
	},

	availableCategories() {
		const parentInstance = Template.instance().parentInstance();
		return Object.keys(parentInstance.categorySearchResults.get());
	},

	availableSubcategories(mainCategory) {
		const parentInstance = Template.instance().parentInstance();
		return parentInstance.categorySearchResults.get()[mainCategory];
	},

	categoryNameMarked() {
		Session.get('locale'); // Reactive dependency
		const parentInstance = Template.instance().parentInstance();
		const search = parentInstance.categorySearch.get();
		const name = mf('category.'+this);
		return markedName(search, name);
	},

	isMobile() {
		const screenXS = SCSSVars.screenXS;
		return Session.get('viewportWidth') <= screenXS;
	}
});

Template.captionsFilter.events({
	'click #toggleFilters'(e, instance) {
		const showAllFilters = instance.showAllFilters;

		showAllFilters.set(!showAllFilters.get());
	},

	'click .js-filter-caption'(e, instance) {
		const caption = instance.$(e.currentTarget);
		const parentInstance = instance.parentInstance();
		const filterName = caption.data('filter-name');

		parentInstance
			.filter
			.toggle('state', filterName)
			.done();

		parentInstance.updateUrl();
	},

	'click .js-filter-course-role'(e, instance) {
		const roleFilter = instance.$(e.currentTarget);
		const parentInstance = instance.parentInstance();
		const filterName = roleFilter.data('filter-name');

		parentInstance
			.filter
			.toggle('needsRole', filterName)
			.done();

		parentInstance.updateUrl();
	},

	'mouseover .js-category-selection-label, mouseout .js-category-selection-label'(e) {
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

	'keyup .js-search-categories'(event, instance) {
		const parentInstance = instance.parentInstance();
		const query = instance.$('.js-search-categories').val();

		parentInstance.updateCategorySearchDebounced(query);
	},

	'click .js-search-categories'(event, instance) {
		instance.$('.dropdown-toggle').dropdown('toggle');
	},

	'click .js-toggle-subcategories'(event, instance) {
		const category = this;

		instance.$(".js-sub-category" + "." + category).toggle();
		instance.$(".js-toggle-subcategories." + category + " span")
		        .toggleClass('fa-angle-down fa-angle-up');
		event.stopPropagation();
	},

	'click .js-category-selection-label'(event, instance) {
		event.preventDefault();
		const parentInstance = instance.parentInstance();

		// Add to filter
		const category = this; // Event context is the category id
		parentInstance.filter.add('categories', "" + category).done();

		// Clear search field
		instance.$('.js-search-categories').val('');

		parentInstance.updateCategorySearch('');
		parentInstance.updateUrl();

		window.scrollTo(0, 0);
	},

	'click .js-remove-category-btn'(event, instance) {
		const parentInstance = instance.parentInstance();
		const category = this;

		parentInstance.filter.remove('categories', '' + category).done();
		parentInstance.updateUrl();
	},
});
