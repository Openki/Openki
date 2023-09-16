import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from '/imports/utils/react-meteor-router';

import { Courses, FindFilter } from '/imports/api/courses/courses';

import * as Metatags from '/imports/utils/metatags';
import { SortSpec } from '/imports/utils/sort-spec';

import { LoadingRow } from '../../loading';
import { useFindFilter } from '/imports/api/courses/publications';
import { Course } from './course';

export function CourselistPage(props: { cssRules: string[]; hideInterested: boolean }) {
	const { cssRules, hideInterested } = props;
	const { t } = useTranslation();

	const query = useSearchParams();
	const sort = query.sort;
	const [limit, setLimit] = useState(parseInt(query.count || '', 10) || 5);

	const filter = Courses.Filtering().read(query).done();

	const filterQuery = filter.toQuery() as FindFilter;
	// Show internal events only when a group is specified
	if (!filterQuery.group && filterQuery.internal === undefined) {
		filterQuery.internal = false;
	}
	const sorting = sort ? SortSpec.fromString(sort) : SortSpec.unordered();
	const [isLoading, coursesList] = useFindFilter(filterQuery, limit + 1, undefined, sorting.spec());

	Metatags.setCommonTags(t('course.list.windowtitle', 'Courses'));

	function courses() {
		return coursesList.slice(0, limit);
	}
	function moreCourses() {
		return coursesList.length > limit;
	}

	return (
		<>
			<style type="text/css">{cssRules.map((cssRule) => cssRule)}</style>
			{courses().length === 0 ? (
				<h2 className="mt-5 text-center">
					{t('frame.courselist.empty', 'There is nothing here yet')}
				</h2>
			) : null}
			{courses().map((course) => (
				<Course key={course._id} course={course} hideInterested={hideInterested} />
			))}
			{isLoading() ? <LoadingRow /> : null}
			{moreCourses() ? (
				<div className="mt-2 text-center">
					<button
						className="js-show-more-courses btn btn-secondary"
						type="button"
						onClick={() => {
							setLimit(limit + 5);
						}}
					>
						{t('_button.more')}
					</button>
				</div>
			) : null}
		</>
	);
}

// for Blaze
// eslint-disable-next-line import/first
import './template.html';

Template.registerHelper('CourselistPage', () => CourselistPage);
