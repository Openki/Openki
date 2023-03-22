import React from 'react';
import { Router } from 'meteor/iron:router';
import { Template } from 'meteor/templating';
import { useTranslation } from 'react-i18next';

import { VenueModel } from '/imports/api/venues/venues';

import './styles.scss';

function Venue(props: { name: string }) {
	const { name } = props;
	return (
		<>
			<span className="fa-solid fa-house fa-fw" aria-hidden="true"></span>&nbsp;
			{name}
		</>
	);
}

function VenueTag(props: { venue: VenueModel; openInNewTab?: boolean | undefined }) {
	const { t } = useTranslation();
	const { venue, openInNewTab } = props;
	if (venue?._id) {
		return (
			<div className="tag tag-link venue-tag">
				<a
					className="js-venue-link"
					data-bs-toggle="tooltip"
					data-bs-title={t('location.link.tooltip', 'Show details of {VENUE}', {
						VENUE: venue.name,
					})}
					href={Router.url('venueDetails', venue)}
					target={openInNewTab ? '_blank' : ''}
				>
					<Venue name={venue.name} />
				</a>
			</div>
		);
	}

	return (
		<div className="tag">
			<Venue name={venue?.name} />
		</div>
	);
}

function RoomTag(props: { name: string | undefined }) {
	const { name } = props;
	if (!name) {
		return null;
	}
	return (
		<div className="tag">
			<span className="fa-solid fa-signs-post fa-fw" aria-hidden="true"></span>&nbsp;
			{name}
		</div>
	);
}

export function VenueLink(props: {
	venue: VenueModel;
	room?: string | undefined;
	openInNewTab?: boolean | undefined;
}) {
	const { venue, room, openInNewTab } = props;
	if (venue?.name) {
		return (
			<>
				<VenueTag venue={venue} openInNewTab={openInNewTab} /> <RoomTag name={room} />
			</>
		);
	}

	return null;
}

// for Blaze
// eslint-disable-next-line import/first
import './template.html';

Template.registerHelper('VenueLink', () => VenueLink);
