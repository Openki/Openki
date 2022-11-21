import { Router } from 'meteor/iron:router';
import { i18n } from '/imports/startup/both/i18next';
import React from 'react';

import './styles.scss';

export function CategoryLabel(props: { category: string }) {
	const { category } = props;
	return <div className="tag category-tag">{i18n(`category.${category}`)}</div>;
}

function CategoryLabelLinked(props: { category: string }) {
	const { category } = props;
	return (
		<div className="tag tag-link category-tag">
			<a
				className={`js-category-label category-${category}`}
				data-category={category}
				data-tooltip={`${i18n('categories.show_courses', 'Show all courses in {CATEGORY}', {
					CATEGORY: i18n(`category.${category}`),
				})}`}
				href={Router.url('home', {}, { query: `categories=${category}` })}
			>
				{i18n(`category.${category}`)}
			</a>
		</div>
	);
}

export function CourseCategories(props: { categories: string[] }) {
	const { categories } = props;
	if (!categories?.length) {
		return null;
	}
	return (
		<div className="tag-group multiline course-categories">
			{categories.map((c) => (
				<CategoryLabelLinked key={c} category={c} />
			))}
		</div>
	);
}

// for Blaze
// eslint-disable-next-line import/first
import './template.html';

Template.registerHelper(CategoryLabel.name, () => CategoryLabel);
Template.registerHelper(CourseCategories.name, () => CourseCategories);
