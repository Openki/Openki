import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { i18n } from '/imports/startup/both/i18next';

import { Roles } from '/imports/api/roles/roles';

import { FilterPreview } from '/imports/ui/lib/filter-preview';
import { ScssVars } from '/imports/ui/lib/scss-vars';
import * as Viewport from '/imports/ui/lib/viewport';
import * as StringTools from '/imports/utils/string-tools';

import '/imports/ui/components/courses/categories';

import './template.html';
import './styles.scss';

{
	type StateFilter = { name: string; cssClass: string; label: string; title: string };

	const Template = TemplateAny as TemplateStaticTyped<
		'filter',
		unknown,
		{
			visibleFilters: string[];
			stateFilters: StateFilter[];
		}
	>;

	const template = Template.filter;

	template.onCreated(function () {
		this.autorun(() => {
			this.stateFilters = [
				{
					name: 'proposal',
					cssClass: 'is-proposal',
					label: i18n('filterCaptions.is-proposal', 'Proposal'),
					title: i18n('filterCaptions.showProposal', 'Show all proposed courses'),
				},
				{
					name: 'upcomingEvent',
					cssClass: 'has-upcoming-events',
					label: i18n('filterCaptions.upcoming.label', 'Upcoming'),
					title: i18n('filterCaptions.upcoming.title', 'Show all courses with upcoming events'),
				},
				{
					name: 'resting',
					cssClass: 'has-past-events',
					label: i18n('filterCaptions.resting.label', 'Resting'),
					title: i18n(
						'filterCaptions.resting.title',
						'Courses with passed but without upcoming events',
					),
				},
			];

			this.visibleFilters = ['state', 'archived', 'needsRole', 'categories'];
		});
	});

	template.helpers({
		filterClasses() {
			const classes = [];
			const instance = Template.instance();
			const parentInstance = instance.parentInstance() as any;

			// check if one of the filters indicated as filters is active
			let activeVisibleFilter = false;
			instance.visibleFilters.forEach((filter) => {
				if (parentInstance.filter.get(filter)) {
					activeVisibleFilter = true;
				}
			});

			if (activeVisibleFilter) {
				classes.push('active');
			}

			if (parentInstance.showingFilters.get()) {
				classes.push('open');
			}

			return classes.join(' ');
		},

		stateFilters() {
			return Template.instance().stateFilters;
		},

		stateFilterClasses(stateFilter: StateFilter) {
			const classes = [];
			const parentInstance = Template.instance().parentInstance() as any;

			classes.push(stateFilter.cssClass);

			if (parentInstance.filter.get('state') === stateFilter.name) {
				classes.push('active');
			}

			if (parentInstance.filter.get('archived')) {
				// make filter buttons yellow if only archived showed
				classes.push('is-archived');
			}

			return classes.join(' ');
		},

		archivedFilterClasses() {
			const classes = ['is-archived'];
			const parentInstance = Template.instance().parentInstance() as any;

			if (parentInstance.filter.get('archived')) {
				classes.push('active');
			}

			return classes.join(' ');
		},

		showingFilters() {
			return (Template.instance().parentInstance() as any).showingFilters.get();
		},
	});

	template.events({
		'click .js-toggle-filters'(_event, instance) {
			const parentInstance = instance.parentInstance() as any;
			const { showingFilters } = parentInstance;

			if (showingFilters.get()) {
				instance.visibleFilters.forEach((filter) => {
					parentInstance.filter.disable(filter);
				});

				parentInstance.filter.done();
				parentInstance.updateUrl();
				showingFilters.set(false);
			} else {
				showingFilters.set(true);
			}
		},

		'click .js-filter-caption'(event, instance) {
			const parentInstance = instance.parentInstance() as any;
			const filterName = instance.$(event.currentTarget as any).data('filter-name');

			parentInstance.filter.toggle('state', filterName).done();

			parentInstance.updateUrl();
		},

		'mouseover .js-filter-caption, mouseout .js-filter-caption'(event, instance) {
			const name = instance.$(event.currentTarget as any).data('filter-name');
			const state = instance.stateFilters.find((f) => f.name === name);

			if (!(instance.parentInstance() as any).filter.get('state')) {
				FilterPreview({
					property: 'state',
					id: (state as any).cssClass,
					activate: event.type === 'mouseover',
				});
			}
		},

		'click .js-filter-caption-archived'(_event, instance) {
			const parentInstance = instance.parentInstance() as any;

			parentInstance.filter.toggle('archived').done();

			parentInstance.updateUrl();
		},

		'mouseover .js-filter-caption-archived, mouseout .js-filter-caption-archived'(event, instance) {
			if (!(instance.parentInstance() as any).filter.get('archived')) {
				FilterPreview({
					property: 'is',
					id: 'archived',
					activate: event.type === 'mouseover',
				});
			}
		},
	});
}

{
	type Role = { icon?: string; name: string; label: string };

	const Template = TemplateAny as TemplateStaticTyped<
		'additionalFilters',
		unknown,
		{ findInstance: any; roles: Role[] }
	>;

	const template = Template.additionalFilters;

	template.onCreated(function () {
		this.findInstance = this.parentInstance(2);
		this.autorun(() => {
			this.roles = [
				{
					name: 'team',
					label: i18n('find.needsOrganizer', 'Looking for an organizer'),
				},
				{
					name: 'mentor',
					label: i18n('find.needsMentor', 'Looking for a mentor'),
				},
				{
					name: 'host',
					label: i18n('find.needsHost', 'Looking for a host'),
				},
			].map(
				// add icon from Roles collection to role object
				(role) => ({ ...role, icon: Roles.find((r) => r.type === role.name)?.icon }),
			);
		});
	});

	template.onRendered(function () {
		const instance = this;
		const catSelect = instance.$('.filter-categories-select');

		catSelect.on('show.bs.dropdown hide.bs.dropdown', () => {
			instance.$('.dropdown-toggle').fadeToggle(200);
		});

		catSelect.on('shown.bs.dropdown', () => {
			instance.$('.js-search-categories').trigger('select');
		});
	});

	template.helpers({
		roles() {
			return Template.instance().roles;
		},

		roleClasses(role: Role) {
			const classes = [];
			const { findInstance } = Template.instance();
			const needsRoleFilter = findInstance.filter.get('needsRole');

			if (needsRoleFilter?.includes(role.name)) {
				classes.push('active');
			}

			return classes.join(' ');
		},

		categories() {
			const { findInstance } = Template.instance();
			return findInstance.filter.get('categories');
		},

		availableCategories() {
			const { findInstance } = Template.instance();
			return Object.keys(findInstance.categorySearchResults.get());
		},

		availableSubcategories(mainCategory: string) {
			const { findInstance } = Template.instance();
			return findInstance.categorySearchResults.get()[mainCategory];
		},

		categoryNameMarked() {
			const search = Template.instance().findInstance.categorySearch.get();

			return StringTools.markedName(search, i18n(`category.${this}`));
		},

		isMobile() {
			return Viewport.get().width <= ScssVars.screenXS;
		},
	});

	template.events({
		'click .js-filter-course-role'(event, instance) {
			const { findInstance } = instance;
			const filterName = instance.$(event.currentTarget as any).data('filter-name');

			findInstance.filter.toggle('needsRole', filterName).done();

			findInstance.updateUrl();
		},

		'mouseover .js-filter-course-role, mouseout .js-filter-course-role'(event, instance) {
			FilterPreview({
				property: 'role',
				id: instance.$(event.currentTarget as any).data('filter-name'),
				activate: event.type === 'mouseover',
			});
		},

		'mouseout .js-category-selection-label, mouseover .js-category-selection-label'(
			this: string,
			event,
		) {
			FilterPreview({
				property: 'category',
				id: this,
				activate: event.type === 'mouseover',
			});
		},

		'keyup .js-search-categories'(_event, instance) {
			const query = instance.$('.js-search-categories').val();

			instance.findInstance.updateCategorySearchDebounced(query);

			instance.$('.dropdown-toggle').dropdown('show');
		},

		'click .js-search-categories'(_event, instance) {
			instance.$('.dropdown-toggle').dropdown('toggle');
		},

		'click .js-toggle-subcategories'(event, instance) {
			event.stopPropagation();
			instance.$(`.js-sub-category.${this}`).toggle();
			instance.$(`.js-toggle-subcategories.${this} span`).toggleClass('fa-angle-down fa-angle-up');
		},

		'click .js-category-selection-label'(event, instance) {
			event.preventDefault();
			const { findInstance } = instance;

			// Add to filter
			findInstance.filter.add('categories', `${this}`).done();

			// Clear search field
			instance.$('.js-search-categories').val('');

			findInstance.updateCategorySearch('');
			findInstance.updateUrl();

			window.scrollTo(0, 0);
		},

		'click .js-remove-category-btn'(_event, instance) {
			const { findInstance } = instance;

			findInstance.filter.remove('categories', `${this}`).done();
			findInstance.updateUrl();
		},
	});
}
