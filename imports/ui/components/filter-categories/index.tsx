import { Router } from 'meteor/iron:router';
import { Template } from 'meteor/templating';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { Categories } from '/imports/api/categories/categories';

import * as Viewport from '/imports/ui/lib/viewport';

import select2 from 'select2';
import 'select2/dist/css/select2.min';
import 'select2-theme-bootstrap5/dist/select2-bootstrap.min';

import '/imports/ui/components/courses/categories';

import './styles.scss';

(select2 as any)();

function FilterCategories(props: {
	categories: string[] | undefined;
	onAdd: (category: string) => void;
	onRemove: (category: string) => void;
}) {
	const categories = Object.keys(Categories);

	const { t } = useTranslation();

	useEffect(() => {
		// re run after viewport change or param change
		Viewport.get();
		// eslint-disable-next-line no-unused-expressions
		Router.current().params;

		$('.js-categories-select')
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
				placeholder: t('find.searchCategories.placeholder', 'Choose categories'),
				language: {
					noResults() {
						return t('find.filter-no-categories-found', 'No categories found');
					},
				},
			})
			.on('select2:select', (event) => {
				props.onAdd(event.params.data.id);
			})
			.on('select2:unselect', (event) => {
				props.onRemove(event.params.data.id);
			});
	});

	if (categories) {
		return (
			<select
				className="js-categories-select categories-select form-control"
				multiple={true}
				value={props.categories}
			>
				{categories.map((category) => (
					<React.Fragment key={category}>
						<option className="categories-select-option" value={category}>
							{t(`category.${category}`)}
						</option>
						{Categories[category].map((subcategory) => (
							<option
								key={subcategory}
								className="categories-select-sub-option"
								value={subcategory}
							>
								{t(`category.${subcategory}`)}
							</option>
						))}
					</React.Fragment>
				))}
			</select>
		);
	}
	return null;
}

// for Blaze
// eslint-disable-next-line import/first
import './template.html';

Template.registerHelper('FilterCategories', () => FilterCategories);
