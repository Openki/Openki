import { ReactiveVar } from 'meteor/reactive-var';
import { i18n } from '/imports/startup/both/i18next';
import { Session } from 'meteor/session';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import moment from 'moment';

import { EventModel } from '/imports/api/events/events';
import * as EventsMethods from '/imports/api/events/methods';

import LocalTime from '/imports/utils/local-time';
import * as Alert from '/imports/api/alerts/alert';

import '/imports/ui/components/buttons';

import './template.html';
import './styles.scss';

const replicaStartDate = (originalDate: moment.MomentInput) => {
	const originalMoment = moment(originalDate);
	const startMoment = moment.max(originalMoment, moment());
	startMoment.day(originalMoment.day());
	return startMoment;
};

const getEventFrequency = (
	originStart: moment.Moment,
	startDate: moment.Moment,
	endDate: moment.Moment,
	frequency: string,
) => {
	const frequencies: {
		[name: string]: {
			unit: moment.unitOfTime.DurationConstructor;
			interval: moment.DurationInputArg1;
		};
	} = {
		once: { unit: 'days', interval: 1 },
		daily: { unit: 'days', interval: 1 },
		weekly: { unit: 'weeks', interval: 1 },
		biWeekly: { unit: 'weeks', interval: 2 },
	};

	if (frequencies[frequency] === undefined) {
		return [];
	}
	const { unit, interval } = frequencies[frequency];

	const originDay = moment(originStart).startOf('day');

	const now = moment();
	const repStart = moment(startDate).startOf('day');
	const days = [];
	const repLimit = 52;

	while (!repStart.isAfter(endDate)) {
		const daysFromOriginal = repStart.diff(originDay, 'days');
		if (daysFromOriginal !== 0 && repStart.isAfter(now)) {
			days.push(daysFromOriginal);
			if (frequency === 'once' || days.length >= repLimit) {
				break;
			}
		}

		repStart.add(interval, unit);
	}

	return days;
};

const Template = TemplateAny as TemplateStaticTyped<
	'eventReplication',
	EventModel,
	{
		calcDays: ReactiveVar<number[]>;
		pickDays: ReactiveVar<number[]>;
		usingPicker: ReactiveVar<boolean>;
		activeDays: () => number[];
		replicateStartDate: ReactiveVar<moment.Moment>;
		replicateEndDate: ReactiveVar<moment.Moment>;
	}
>;

const template = Template.eventReplication;

template.onCreated(function () {
	const instance = this;

	instance.busy(false);

	// Store the current date selection for replication
	// Days are stored as difference from the original day
	instance.calcDays = new ReactiveVar([]); // calculated from the dialog
	instance.pickDays = new ReactiveVar([]); // picked in the calendar
	instance.usingPicker = new ReactiveVar(false);

	instance.activeDays = () =>
		instance.usingPicker.get() ? instance.pickDays.get() : instance.calcDays.get();

	const { data } = instance;
	instance.replicateStartDate = new ReactiveVar(replicaStartDate(data.start));
	instance.replicateEndDate = new ReactiveVar(replicaStartDate(moment(data.start).add(1, 'week')));

	instance.calcDays.set(
		getEventFrequency(
			moment(instance.data.start),
			instance.replicateStartDate.get(),
			instance.replicateEndDate.get(),
			'weekly',
		),
	);
});

template.onRendered(function () {
	const instance = this;

	const pickDays: Date[] = [];

	instance.autorun(() => {
		Session.get('locale');

		instance.$('.js-replicate-date').datepicker('destroy');
		instance.$('.js-replicate-date').datepicker({
			weekStart: moment.localeData().firstDayOfWeek(),
			language: moment.locale(),
			autoclose: true,
			startDate: new Date(),
			format: {
				toDisplay(date) {
					return moment.utc(date).format('L');
				},
				toValue(date) {
					return moment.utc(date, 'L').toDate();
				},
			},
		});

		instance.$('.js-replicate-datepick').datepicker('destroy');
		instance.$('.js-replicate-datepick').datepicker({
			weekStart: moment.localeData().firstDayOfWeek(),
			language: moment.locale(),
			multidate: true,
			multidateSeparator: ', ',
			todayHighlight: true,
			startDate: new Date(),
		});

		instance.$('.js-replicate-datepick').datepicker('setDates', pickDays);
	});
});

template.helpers({
	replicaStart() {
		const startDate = Template.instance().replicateStartDate.get();
		return replicaStartDate(startDate).format('L');
	},

	replicaEnd() {
		const endDate = Template.instance().replicateEndDate.get();
		return replicaStartDate(endDate).format('L');
	},

	replicateStartDay() {
		const startDate = Template.instance().replicateStartDate.get();
		return moment(startDate).format('ddd');
	},

	replicateEndDay() {
		const endDate = Template.instance().replicateEndDate.get();
		return moment(endDate).format('ddd');
	},
	replicaDateCount: () => Template.instance().activeDays().length,

	replicaDates() {
		const event = Template.currentData();
		const start = moment(event.start);
		return Template.instance()
			.activeDays()
			.map((days) => moment(start).add(days, 'days'));
	},
});

template.events({
	'changeDate .js-replicate-datepick'(event, instance) {
		const pickDays = (event as unknown as { dates: number[] }).dates;

		const origin = moment(instance.data.start).startOf('day');
		const days = pickDays.map((date) => moment(date).diff(origin, 'days'));
		instance.pickDays.set(days);
	},

	'show.bs.tab a[data-toggle="tab"]'(event, instance) {
		const targetHref = $(event.target).attr('href');
		instance.usingPicker.set(targetHref === '#datepicker');
	},

	'click .js-replicate-btn'(_event, instance) {
		instance.busy('saving');

		const startLocal = LocalTime.fromString(instance.data.startLocal);
		const endLocal = LocalTime.fromString(instance.data.endLocal);

		const replicaDays = instance.activeDays();
		let removed = 0;
		let responses = 0;
		replicaDays.forEach((days) => {
			/* create a new event for each time interval */
			const replicaEvent: EventsMethods.SaveFields = {
				startLocal: LocalTime.toString(moment(startLocal).add(days, 'days')),
				endLocal: LocalTime.toString(moment(endLocal).add(days, 'days')),
				title: instance.data.title,
				description: instance.data.description,
				venue: instance.data.venue,
				room: instance.data.room || '',
				region: instance.data.region,
				groups: instance.data.groups,
				// delegate the same replicaOf ID for this replica if the replicated event is also a replica
				replicaOf: instance.data.replicaOf || instance.data._id,
				internal: instance.data.internal,
				maxParticipants: instance.data.maxParticipants,
			};

			const { courseId } = instance.data;
			if (courseId) {
				replicaEvent.courseId = courseId;
			}

			// To create a new event, pass an empty Id
			const eventId = '';
			const args = { eventId, changes: replicaEvent };

			EventsMethods.save(args)
				.then(() => {
					removed += 1;
				})
				.catch((error) => {
					const start = moment(replicaEvent.startLocal).format('llll');
					Alert.serverError(
						error,
						i18n('eventReplication.errWithReason', 'Could not create the copy on "{START}".', {
							START: start,
						}),
					);
				})
				.finally(() => {
					responses += 1;
					if (responses === replicaDays.length) {
						instance.busy(false);
						if (removed) {
							const start = moment(replicaEvent.startLocal).format('llll');
							Alert.success(
								i18n(
									'event.replicate.successCondensed',
									'Cloned event "{TITLE}" {NUM, plural, one{for} other{# times until} } {DATE}',
									{
										TITLE: instance.data.title,
										NUM: removed,
										DATE: start,
									},
								),
							);
						}
						if (removed === responses) {
							const parentInstance = instance.parentInstance() as any;
							parentInstance.replicating.set(false);
							parentInstance.collapse();
						}
					}
				});
		});
	},

	'change .js-update-replicas, keyup .js-update-replicas'(_event, instance) {
		let startDate = moment(instance.$('#replicateStart').val(), 'L');
		if (!startDate.isValid()) {
			instance.calcDays.set([]);
			return;
		}
		if (startDate.isBefore(moment())) {
			// Jump forward in time so we don't have to look at all these old dates
			startDate = replicaStartDate(startDate);
		}

		instance.replicateStartDate.set(startDate);

		const endDate = moment(instance.$('#replicateEnd').val(), 'L');
		if (!endDate.isValid()) {
			instance.calcDays.set([]);
			return;
		}

		instance.replicateEndDate.set(endDate);

		const frequency = instance.$('.js-replicate-frequency:checked').val() as string;

		instance.calcDays.set(
			getEventFrequency(moment(instance.data.start), startDate, endDate, frequency),
		);
	},

	'mouseover .js-replicate-btn'(_event, instance) {
		instance.$('.replica-event-captions').addClass('highlighted');
	},

	'mouseout .js-replicate-btn'(_event, instance) {
		instance.$('.replica-event-captions').removeClass('highlighted');
	},

	'click .js-cancel-replication'(_event, instance) {
		const parentInstance = instance.parentInstance() as any;
		parentInstance.replicating.set(false);
		parentInstance.collapse();
	},
});
