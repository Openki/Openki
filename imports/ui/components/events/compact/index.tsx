/* eslint-disable no-nested-ternary */
import { Template } from 'meteor/templating';
import React from 'react';
import { Router } from 'meteor/iron:router';
import { useUserId } from '/imports/utils/react-meteor-data';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

import { EventModel } from '/imports/api/events/events';

import { InternalIndicator } from '/imports/ui/components/internal-indicator';
import { VenueLink } from '/imports/ui/components/venues/link';

import { useDateTimeFormat } from '/imports/utils/react-moment-format';

import './styles.scss';

function eventCompactClasses(event: EventModel, withDate: boolean) {
	const classes = [];
	if (withDate) {
		classes.push('has-date');
	}
	if (moment().isAfter(event.end) || event.isFullyBooked() || event.canceled) {
		classes.push('is-past');
	}

	return classes.join(' ');
}

function showImage(event: EventModel, withImage: boolean) {
	if (!withImage) {
		return false;
	}

	const src = event?.publicImageUrl();
	if (!src) {
		return false;
	}

	return true;
}

function bodyStyle(event: EventModel, withImage: boolean) {
	if (!withImage) {
		return {};
	}

	const src = event?.publicImageUrl();
	if (!src) {
		return {};
	}

	return {
		backgroundImage: `linear-gradient(to bottom, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0.75)), url('${src}')`,
		backgroundPosition: 'center',
		backgroundSize: 'cover',
	};
}

export function EventCompact(props: {
	event: EventModel;
	withDate: boolean;
	withImage: boolean;
	openInNewTab: boolean;
}) {
	const { event, withDate, withImage, openInNewTab } = props;
	const { t } = useTranslation();
	const { weekdayFormat, calendarDayShort, timeFormat } = useDateTimeFormat();
	const userId = useUserId();

	return (
		<div className="event-compact-wrap">
			<a
				href={Router.path('showEvent', { _id: event._id, slug: event.slug })}
				target={openInNewTab ? '_blank' : ''}
			>
				<div className={`event-compact ${eventCompactClasses(event, withDate)}`}>
					{event.canceled ? (
						<span className="event-canceled">{t('course.event.canceled', 'Canceled')}</span>
					) : event.isFullyBooked() ? (
						<span className="event-fully-booked">
							{t('course.event.fullyBooked', 'Fully booked')}
						</span>
					) : null}
					<div
						className={`event-compact-header${
							event.attendedBy(userId) ? ' user-attends-event' : ''
						}`}
					>
						{withDate ? (
							<>
								<span className="fa-regular fa-calendar-days fa-fw" aria-hidden="true"></span>{' '}
								{weekdayFormat(event.startLocal)}
								{calendarDayShort(event.startLocal)}
								<br />
							</>
						) : null}
						<span className="fa-regular fa-clock fa-fw" aria-hidden="true"></span>{' '}
						<span className="event-compact-time">
							{timeFormat(event.startLocal)} - {timeFormat(event.endLocal)}
						</span>
						{event.venue ? (
							<>
								<br />
								<div className="tag-group">
									<VenueLink venue={event.venue} room={event.room} openInNewTab={openInNewTab} />
								</div>
							</>
						) : null}
					</div>
					<div className="event-compact-body" style={bodyStyle(event, withImage)}>
						{event.internal ? <InternalIndicator /> : null}
						<h4 className="event-compact-title">{event.title}</h4>
						<br />
						<p
							className={`event-compact-description${
								showImage(event, withImage) ? ' event-compact-description-with-image' : ''
							}`}
							dangerouslySetInnerHTML={{ __html: event.description }}
						></p>
					</div>
				</div>
			</a>
		</div>
	);
}

// for Blaze
// eslint-disable-next-line import/first
import './template.html';

Template.registerHelper('EventCompact', () => EventCompact);
