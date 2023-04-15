import { ReactiveDict } from 'meteor/reactive-dict';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { _ } from 'meteor/underscore';

import { Categories } from '/imports/api/categories/categories';

import '/imports/ui/components/buttons';
import '/imports/ui/components/courses/categories';

import './template.html';

export type Data = {
	onChange: (selectedCategories: string[]) => void;
	categories: string[];
};

{
	const Template = TemplateAny as TemplateStaticTyped<
		'editCategories',
		Data,
		{
			state: ReactiveDict<{
				selectedCategories: string[];
			}>;
		}
	>;

	const template = Template.editCategories;

	template.onCreated(function () {
		const instance = this;

		instance.state = new ReactiveDict();
		instance.state.setDefault({
			selectedCategories: [],
		});

		instance.autorun(() => {
			const data = Template.currentData();

			// Show category selection right away for new courses
			instance.state.set('selectedCategories', data.categories);
		});
	});

	template.helpers({
		availableCategories() {
			return Object.keys(Categories);
		},

		hasSubcategories(category: string) {
			return Categories[category].length > 0;
		},

		availableSubcategories(category: string) {
			// Hide if parent categories not selected
			const selectedCategories = Template.instance().state.get('selectedCategories');
			if (!selectedCategories?.includes(category)) {
				return [];
			}

			return Categories[category];
		},

		isChecked() {
			const selectedCategories = Template.instance().state.get('selectedCategories');
			return selectedCategories?.includes(`${this}`) ? 'checkbox-checked' : '';
		},

		checkCategory() {
			const selectedCategories = Template.instance().state.get('selectedCategories');
			return selectedCategories?.includes(`${this}`) ? 'checked' : '';
		},
	});

	template.events({
		'change .js-category-checkbox'(_event, instance) {
			const catKey = `${this}`;
			let selectedCategories = instance.state.get('selectedCategories') || [];
			const checked = instance.$(`input.cat_${catKey}`).prop('checked');
			if (checked) {
				selectedCategories.push(catKey);
				selectedCategories = [...new Set(selectedCategories)]; // make unique
			} else {
				selectedCategories = selectedCategories.filter((c) => c !== catKey);

				if (Categories[catKey]) {
					// Remove all the subcategories as well
					selectedCategories = _.difference(selectedCategories, Categories[catKey]);
				}
			}

			instance.state.set('selectedCategories', selectedCategories);

			instance.data.onChange(selectedCategories);
		},
	});
}
