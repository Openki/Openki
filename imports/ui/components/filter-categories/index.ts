import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { i18n } from '/imports/startup/both/i18next';

import Categories from '/imports/api/categories/categories';

import { FilterPreview } from '/imports/ui/lib/filter-preview';
import * as StringTools from '/imports/utils/string-tools';

import '/imports/ui/components/courses/categories';

import './template.html';
import './styles.scss';

const Template = TemplateAny as TemplateStaticTyped<
	'filterCategories',
	{ categories: string[]; onAdd: (category: string) => void; onRemove: (category: string) => void },
	{
		categorySearch: ReactiveVar<string>;
		categorySearchResults: ReactiveVar<{
			[name: string]: string[];
		}>;
		updateCategorySearch: (query: string) => void;
	}
>;

const template = Template.filterCategories;

template.onCreated(function () {
	const instance = this;

	instance.updateCategorySearch = function (query) {
		instance.categorySearch.set(query);

		if (!query) {
			instance.categorySearchResults.set(Categories);
			return;
		}

		const queryToLowerCase = query.toLowerCase();
		const results = {} as {
			[name: string]: string[];
		};

		Object.keys(Categories).forEach((mainCategory) => {
			if (i18n(`category.${mainCategory}`).toLowerCase().includes(queryToLowerCase)) {
				results[mainCategory] = [] as string[];
			}
			Categories[mainCategory].forEach((subCategory) => {
				if (i18n(`category.${subCategory}`).toLowerCase().includes(queryToLowerCase)) {
					if (results[mainCategory]) {
						results[mainCategory].push(subCategory);
					} else {
						results[subCategory] = [];
					}
				}
			});
		});
		instance.categorySearchResults.set(results);
	};

	instance.categorySearch = new ReactiveVar('');
	instance.categorySearchResults = new ReactiveVar(Categories);
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
	availableCategories() {
		const instance = Template.instance();
		return Object.keys(instance.categorySearchResults.get());
	},

	availableSubcategories(mainCategory: string) {
		const instance = Template.instance();
		return instance.categorySearchResults.get()[mainCategory];
	},

	categoryNameMarked() {
		const search = Template.instance().categorySearch.get();

		return StringTools.markedName(search, i18n(`category.${this}`));
	},
});

template.events({
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

	'keyup .js-search-categories': _.debounce((_event, instance) => {
		const query = instance.$('.js-search-categories').val() as string;

		instance.updateCategorySearch(query);

		instance.$('.dropdown-toggle').dropdown('show');
	}, 200),

	'click .js-search-categories'(_event, instance) {
		instance.$('.dropdown-toggle').dropdown('toggle');
	},

	'click .js-toggle-subcategories'(this: string, event, instance) {
		event.stopPropagation();

		instance.$(`.js-sub-category.${this}`).toggle();
		instance.$(`.js-toggle-subcategories.${this} span`).toggleClass('fa-angle-down fa-angle-up');
	},

	'click .js-category-selection-label'(this: string, event, instance) {
		event.preventDefault();

		// Clear search field
		instance.$('.js-search-categories').val('');

		instance.updateCategorySearch('');

		instance.data.onAdd(this);
	},

	'click .js-remove-category-btn'(this: string, _event, instance) {
		instance.data.onRemove(this);
	},
});
