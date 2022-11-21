import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { i18n } from '/imports/startup/both/i18next';

import { Categories } from '/imports/api/categories/categories';

import * as Viewport from '/imports/ui/lib/viewport';
import { MeteorAsync } from '/imports/utils/promisify';

import select2 from 'select2';
import 'select2/dist/css/select2.min';
import 'select2-theme-bootstrap5/dist/select2-bootstrap.min';

import '/imports/ui/components/courses/categories';

import './template.html';
import './styles.scss';

(select2 as any)();

const Template = TemplateAny as TemplateStaticTyped<
	'filterCategories',
	{
		categories: string[] | undefined;
		onAdd: (category: string) => void;
		onRemove: (category: string) => void;
	}
>;

const template = Template.filterCategories;

template.onRendered(function () {
	const instance = this;

	instance.autorun(async () => {
		// re run after viewport change or param change
		Viewport.get();
		// eslint-disable-next-line no-unused-expressions
		Router.current().params;

		await MeteorAsync.defer();

		instance
			.$('.js-categories-select')
			.select2({
				theme: 'bootstrap',
				templateResult(data: any) {
					// We only really care if there is an element to pull classes from
					if (!data.element) {
						return data.text;
					}

					const $element = $(data.element);

					const $wrapper = $('<span></span>');
					$wrapper.addClass($element[0].className);

					$wrapper.text(data.text);

					return $wrapper;
				},
				placeholder: i18n('find.searchCategories.placeholder', 'Choose categories'),
				language: {
					noResults() {
						return i18n('find.filter-no-categories-found', 'No categories found');
					},
				},
			})
			.on('select2:select', (event) => {
				instance.data.onAdd(event.params.data.id);
			})
			.on('select2:unselect', (event) => {
				instance.data.onRemove(event.params.data.id);
			});
	});
});

template.helpers({
	categories() {
		return Object.keys(Categories);
	},

	subcategories(mainCategory: string) {
		return Categories[mainCategory];
	},

	categoryName(category: string) {
		return i18n(`category.${category}`);
	},

	categorySelected(category: string) {
		const { data } = Template.instance();
		if (!data.categories?.includes(category)) {
			return {};
		}
		return { selected: 'selected' };
	},
});
