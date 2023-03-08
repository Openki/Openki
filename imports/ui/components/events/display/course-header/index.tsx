import { Router } from 'meteor/iron:router';
import { useTranslation } from 'react-i18next';
import { Template } from 'meteor/templating';
import React from 'react';

import { CourseCategories } from '/imports/ui/components/courses/categories';
import { RegionTag } from '/imports/ui/components/regions/tag';

import './styles.scss';

export type Data = {
	courseId: string;
	regionId: string;
	categories: string[];
	title: string;
	image: string;
};

export function EventCourseHeader(props: Data) {
	const { t } = useTranslation();
	return (
		<div
			className="event-course-header"
			onClick={() => {
				Router.go('showCourse', { _id: props.courseId });
			}}
			style={
				props.image
					? {
							backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.75)), url('${props.image}')`,
							backgroundPosition: 'center',
							backgroundSize: 'cover',
					  }
					: undefined
			}
		>
			<a
				href={Router.path('showCourse', { _id: props.courseId })}
				className="event-course-header-link"
			>
				<i className="fa-solid fa-angle-left fa-fw" aria-hidden="true"></i>
				{t('event.details.viewCourse', 'To the course overview')}
			</a>
			<h2>{props.title}</h2>

			<CourseCategories categories={props.categories} />
			<RegionTag region={props.regionId} />
		</div>
	);
}

// for Blaze
// eslint-disable-next-line import/first
import './template.html';

Template.registerHelper(EventCourseHeader.name, () => EventCourseHeader);
