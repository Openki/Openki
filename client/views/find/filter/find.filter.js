Template.filter.onCreated(function() {
	this.stateFilters =
		[
			{ name: 'proposal'
			, cssClass: 'is-proposal'
			, label: mf('filterCaptions.proposal', 'Proposal')
			, title: mf('filterCaptions.showProposal', 'Show all proposed courses')
			}
		,
			{ name: 'upcomingEvent'
			, cssClass: 'has-upcoming-events'
			, label: mf('filterCaptions.upcoming.label', 'Upcoming')
			, title: mf('filterCaptions.upcoming.title', 'Show all courses with upcoming events')
			}
		,
			{ name: 'pastEvent'
			, cssClass: 'has-past-events'
			, label: mf('filterCaptions.passed.label', 'Passed')
			, title: mf('filterCaptions.passed.title', 'Show all courses with passed events')
			}
		];
});

Template.filter.helpers({
	filterClasses() {
		const classes = [];
		const parentInstance = Template.instance().parentInstance();

		if (parentInstance.showingFilters.get()) classes.push('active');

		return classes.join(' ');
	},

	stateFilters() {
		return Template.instance().stateFilters;
	},

	stateFilterClasses(stateFilter) {
		const classes = [];
		const parentInstance = Template.instance().parentInstance();

		classes.push(stateFilter.cssClass);

		if (parentInstance.filter.get('state') == stateFilter.name) {
			classes.push('active');
		}

		return classes.join(' ');
	},

	showingFilters() {
		return Template.instance().parentInstance().showingFilters.get();
	}
});

Template.filter.events({
	'click #toggleFilters'(e, instance) {
		const parentInstance = instance.parentInstance();
		const showingFilters = parentInstance.showingFilters;

		if (showingFilters.get()) {
			parentInstance.filter
				.disable('state')
				.disable('needsRole')
				.disable('categories')
				.done();

			parentInstance.updateUrl();
			showingFilters.set(false);
		} else {
			showingFilters.set(true);
		}
	},

	'click .js-filter-caption'(e, instance) {
		const parentInstance = instance.parentInstance();
		const filterName = instance.$(e.currentTarget).data('filter-name');

		parentInstance.filter
			.toggle('state', filterName)
			.done();

		parentInstance.updateUrl();
	}
});

Template.additionalFilters.onCreated(function() {
	this.findInstance = this.parentInstance(2);

	this.roles =
		[
			{ name: 'team'
			, label: mf('find.needsOrganizer', 'Looking for an organizer')
			}
		,
			{ name: 'mentor'
			, label: mf('find.needsMentor', 'Looking for a mentor')
			}
		,
			{ name: 'host'
			, label: mf('find.needsHost', 'Looking for a host')
			}
		]
		.map(role => {
			// add icon from Roles collection to role object
			role.icon =
				_.findWhere(Roles, { type: role.name } ).icon;

			return role;
		});
});

Template.additionalFilters.onRendered(function() {
	const instance = this;
	const catSelect = instance.$('.filter-categories-select');

	catSelect.on('show.bs.dropdown hide.bs.dropdown', () => {
		instance.$('.dropdown-toggle').fadeToggle(200);
	});

	catSelect.on('shown.bs.dropdown', () => {
		instance.$('.js-search-categories').select();
	});
});

Template.additionalFilters.helpers({
	roles() {
		return Template.instance().roles;
	},

	roleClasses(role) {
		const classes = [];
		const findInstance = Template.instance().findInstance;
		const needsRoleFilter = findInstance.filter.get('needsRole');

		if (needsRoleFilter && needsRoleFilter.indexOf(role.name) >= 0) {
			classes.push('active');
		}

		return classes.join(' ');
	},

	categories() {
		const findInstance = Template.instance().findInstance;
		return findInstance.filter.get('categories');
	},

	availableCategories() {
		const findInstance = Template.instance().findInstance;
		return Object.keys(findInstance.categorySearchResults.get());
	},

	availableSubcategories(mainCategory) {
		const findInstance = Template.instance().findInstance;
		return findInstance.categorySearchResults.get()[mainCategory];
	},

	categoryNameMarked() {
		Session.get('locale'); // Reactive dependency
		const search =
			Template.instance().findInstance.categorySearch.get();

		return markedName(search, mf('category.' + this));
	},

	isMobile() {
		return Session.get('viewportWidth') <= SCSSVars.screenXS;
	}
});

Template.additionalFilters.events({
	'click .js-filter-course-role'(e, instance) {
		const findInstance = instance.findInstance;
		const filterName = instance.$(e.currentTarget).data('filter-name');

		findInstance.filter
			.toggle('needsRole', filterName)
			.done();

		findInstance.updateUrl();
	},

	'mouseout .js-category-selection-label, mouseover .js-category-selection-label'(e) {
		const activate = e.type == 'mouseover';
		const previewOptions = {
			selector: ('.category-' + this),
			activate
		};
		courseFilterPreview(previewOptions);

		$('.js-category-label.category-' + this)
			.parent()
			.toggleClass('highlight');
	},

	'keyup .js-search-categories'(e, instance) {
		const query = instance.$('.js-search-categories').val();

		instance.findInstance.updateCategorySearchDebounced(query);
	},

	'click .js-search-categories'(e, instance) {
		instance.$('.dropdown-toggle').dropdown('toggle');
	},

	'click .js-toggle-subcategories'(e, instance) {
		instance.$(".js-sub-category" + "." + this).toggle();
		instance.$(".js-toggle-subcategories." + this + " span")
			.toggleClass('fa-angle-down fa-angle-up');
		event.stopPropagation();
	},

	'click .js-category-selection-label'(e, instance) {
		e.preventDefault();
		const findInstance = instance.findInstance;

		// Add to filter
		findInstance.filter.add('categories', "" + this).done();

		// Clear search field
		instance.$('.js-search-categories').val('');

		findInstance.updateCategorySearch('');
		findInstance.updateUrl();

		window.scrollTo(0, 0);
	},

	'click .js-remove-category-btn'(e, instance) {
		const findInstance = instance.findInstance;

		findInstance.filter.remove('categories', '' + this).done();
		findInstance.updateUrl();
	}
});
