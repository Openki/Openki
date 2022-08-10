import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { i18n } from '/imports/startup/both/i18next';

import { Roles } from '/imports/api/roles/roles';

import { FilterPreview } from '/imports/ui/lib/filter-preview';

import '/imports/ui/components/filter-categories';
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
	type Role = { icon?: string | undefined; name: string; label: string };

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

		filterCategoriesAttr() {
			const { findInstance } = Template.instance();
			return {
				categories: findInstance.filter.get('categories'),
				onAdd: (category: string) => {
					findInstance.filter.add('categories', category).done();
					findInstance.updateUrl();
				},
				onRemove: (category: string) => {
					findInstance.filter.remove('categories', category).done();
					findInstance.updateUrl();
				},
			};
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
	});
}
