import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import moment from 'moment';

import { EventModel } from '/imports/api/events/events';
import { VenueModel } from '/imports/api/venues/venues';

import './template.html';
import './styles.scss';

export interface RelStartEnd {
	relStart: number;
	relEnd: number;
}

export interface Data {
	days: ({
		moment: moment.Moment;
	} & RelStartEnd)[];
	hours: ({
		moment: moment.Moment;
	} & RelStartEnd)[];
	grouped: {
		perRoom: {
			room: string;
			venue: VenueModel;
			rows: (EventModel & RelStartEnd)[];
		}[];
		venue: VenueModel;
	}[];
}

const Template = TemplateAny as TemplateStaticTyped<
	Data,
	'kioskTimetablePage',
	Record<string, never>
>;

const template = Template.kioskTimetablePage;

template.helpers({
	isRoomRow(room: string, index: number) {
		return room && index !== 0;
	},
	position(this: RelStartEnd) {
		return `left: ${this.relStart * 100}%; right: ${this.relEnd * 100}%;`;
	},
	showDay(m: moment.Moment) {
		return m.format('dddd, LL');
	},
	showHour(m: moment.Moment) {
		return m.format('H');
	},
});
