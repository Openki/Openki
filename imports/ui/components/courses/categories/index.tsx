import { Router } from 'meteor/iron:router';
import { useTranslation } from 'react-i18next';
import { Template } from 'meteor/templating';
import React from 'react';

import './styles.scss';

export function CategoryLabel(props: { category: string }) {
	const { category } = props;
	const { t } = useTranslation();
	return <div className="tag category-tag">{t(`category.${category}`)}</div>;
}

function CategoryLabelLinked(props: { category: string }) {
	const { category } = props;
	const { t } = useTranslation();
	return (
		<div className="tag tag-link category-tag">
			<a
				className={`js-category-label category-${category}`}
				data-category={category}
				data-bs-toggle="tooltip"
				data-bs-title={`${t('categories.show_courses', 'Show all in {CATEGORY}', {
					CATEGORY: t(`category.${category}`),
				})}`}
				href={Router.url('home', {}, { query: `categories=${category}` })}
			>
				{t(`category.${category}`)}
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
