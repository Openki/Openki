import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import moment from 'moment';

import { EventModel } from '/imports/api/events/events';

import '/imports/ui/components/groups/list';
import '../../venues/link';

import './template.html';
import './styles.scss';

const Template = TemplateAny as TemplateStaticTyped<'eventCompact', unknown, { withDate: boolean }>;

const template = Template.eventCompact;

template.onCreated(function () {
	this.withDate = this.parentInstance()?.data.withDate || false;
});

template.helpers({
	eventCompactClasses(this: EventModel) {
		const classes = [];
		if (Template.instance().withDate) {
			classes.push('has-date');
		}
		if (moment().isAfter(this.end)) {
			classes.push('is-past');
		}

		return classes.join(' ');
	},

	withDate() {
		return Template.instance().withDate;
	},
});

template.events({
	'mouseover .js-venue-link, mouseout .js-venue-link'(_event, instance) {
		instance.$('.event-compact').toggleClass('elevate-child');
	},
});
