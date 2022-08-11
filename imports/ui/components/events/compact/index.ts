import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import moment from 'moment';

import { EventModel } from '/imports/api/events/events';

import '/imports/ui/components/groups/list';
import '/imports/ui/components/venues/link';

import './template.html';
import './styles.scss';

const Template = TemplateAny as TemplateStaticTyped<
	'eventCompact',
	{ event: EventModel; withDate?: boolean; withImage?: boolean; openInNewTab?: boolean }
>;

const template = Template.eventCompact;

template.helpers({
	eventCompactClasses() {
		const { event, withDate } = Template.instance().data;

		const classes = [];
		if (withDate) {
			classes.push('has-date');
		}
		if (moment().isAfter(event.end)) {
			classes.push('is-past');
		}

		return classes.join(' ');
	},

	showImage() {
		const { event, withImage } = Template.instance().data;

		if (!withImage) {
			return false;
		}

		const src = event?.publicImageUrl();
		if (!src) {
			return false;
		}

		return true;
	},

	bodyStyle() {
		const { event, withImage } = Template.instance().data;

		if (!withImage) {
			return '';
		}

		const src = event?.publicImageUrl();
		if (!src) {
			return '';
		}

		return {
			style: `
	background-image: linear-gradient(to bottom, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0.75)), url('${src}');
	background-position: center;
	background-size: cover;`,
		};
	},
});

template.events({
	'mouseover .js-venue-link, mouseout .js-venue-link'(_event, instance) {
		instance.$('.event-compact').toggleClass('elevate-child');
	},
});
