import '/imports/LocalTime.js';

const replicaStartDate = originalDate => {
	const originalMoment = moment(originalDate);
	const startMoment = moment.max(originalMoment, moment());
	startMoment.day(originalMoment.day());
	return startMoment;
};

Template.eventReplication.onCreated(function eventReplicationOnCreated() {
	const instance = this;

	instance.busy(false);

	// Store the current date selection for replication
	// Days are stored as difference from the original day
	instance.calcDays = new ReactiveVar([]); // calculated from the dialog
	instance.pickDays = new ReactiveVar([]); // picked in the calendar
	instance.usingPicker = new ReactiveVar(true);

	instance.activeDays = () => {
		return (
			instance.usingPicker.get()
			? instance.pickDays.get()
			: instance.calcDays.get()
		);
	};

	const data = instance.data;
	instance.replicateStartDate = new ReactiveVar(replicaStartDate(data.start));
	instance.replicateEndDate = new ReactiveVar(replicaStartDate(moment(data.start).add(1, 'week')));
});


Template.eventReplication.onRendered(function() {
	const instance = this;

	let pickDays = [];

	instance.autorun(() => {
		Session.get('locale');

		instance.$('.js-replicate-date').datepicker('destroy');
		instance.$('.js-replicate-date').datepicker({
			weekStart: moment.localeData().firstDayOfWeek(),
			language: moment.locale(),
			autoclose: true,
			startDate: new Date(),
			format: {
				toDisplay: date => moment(date).format('L'),
				toValue: date => moment(date, 'L').toDate()
			}
		});

		instance.$('.js-replicate-datepick').datepicker('destroy');
		instance.$('.js-replicate-datepick').datepicker({
			weekStart: moment.localeData().firstDayOfWeek(),
			language: moment.locale(),
			multidate: true,
			multidateSeperator: ", ",
			todayHighlight: true,
			startDate: new Date()
		});

		instance.$('.js-replicate-datepick').datepicker('setDates', pickDays);
	});
});

Template.eventReplication.helpers({
	replicaStart() {
		const startDate = Template.instance().replicateStartDate.get();
		return replicaStartDate(startDate).format("L");
	},

	replicaEnd() {
		const endDate = Template.instance().replicateEndDate.get();
		return replicaStartDate(endDate).format("L");
	},

	replicateStartDay() {
		const startDate = Template.instance().replicateStartDate.get();
		return moment(startDate).format('ddd');
	},

	replicateEndDay() {
		const endDate = Template.instance().replicateEndDate.get();
		return moment(endDate).format('ddd');
	},

	localDate: date => moment(date).format("l"),

	fullDate: date => moment(date).format("LLLL"),

	weekDay: date => moment(date).format("ddd"),

	affectedReplicaCount() {
		Template.instance().subscribe('affectedReplica', this._id);
		return Events.find(affectedReplicaSelectors(this)).count();
	},

	replicaDateCount: () => Template.instance().activeDays().length,

	replicaDates() {
		const start = moment(this.start);
		return Template.instance().activeDays().map(days => {
			return moment(start).add(days, 'days');
		});
	}
});

const getEventFrequency = instance => {
	let startDate = moment(instance.$('#replicateStart').val(), 'L');
	if (!startDate.isValid()) return [];
	if (startDate.isBefore(moment())) {
		// Jump forward in time so we don't have to look at all these old dates
		startDate = replicaStartDate(startDate);
	}

	const endDate   = moment(instance.$('#replicateEnd').val(), 'L');
	if (!endDate.isValid()) return [];
	const frequency = instance.$('.js-replicate-frequency:checked').val();

	const frequencies =
		{ once: { unit: 'days',   interval: 1 }
		, daily: { unit: 'days',   interval: 1 }
		, weekly: { unit: 'weeks',  interval: 1 }
		, biWeekly: { unit: 'weeks',  interval: 2 }
		};

	if (frequencies[frequency] === undefined) return [];
	const unit = frequencies[frequency].unit;

	const interval = frequencies[frequency].interval;

	const eventStart = moment(instance.data.start);
	const originDay = moment(eventStart).startOf('day');

	const now = moment();
	const repStart = moment(startDate).startOf('day');
	const days = [];
	const repLimit = 52;

	while(!repStart.isAfter(endDate)) {
		const daysFromOriginal = repStart.diff(originDay, 'days');
		if (daysFromOriginal !== 0 && repStart.isAfter(now)) {
			days.push(daysFromOriginal);
			if (frequency == 'once') break;
			if (days.length >= repLimit) break;
		}

		repStart.add(interval, unit);
	}

	return days;
};


Template.eventReplication.events({
	'changeDate .js-replicate-date'(event, instance) {
		const targetID = event.target.id;
		const date = event.date;
		if (targetID === 'replicateStart') {
			instance.replicateStartDate.set(date);
		} else if (targetID === 'replicateEnd') {
			instance.replicateEndDate.set(date);
		}
	},

	'changeDate .js-replicate-datepick'(event, instance) {
		pickDays = event.dates;

		const origin = moment(instance.data.start).startOf('day');
		const days = pickDays.map(date => {
			return moment(date).diff(origin, 'days');
		});
		instance.pickDays.set(days);
	},

	'show.bs.tab a[data-toggle="tab"]'(event, instance) {
		const targetHref = $(event.target).attr('href');
		instance.usingPicker.set(targetHref == '#datepicker');
	},

	'click .js-replicate-btn'(event, instance) {
		const startLocal = LocalTime.fromString(instance.data.startLocal);
		const endLocal   = LocalTime.fromString(instance.data.endLocal);

		const replicaDays = instance.activeDays();
		replicaDays.forEach((days, i) => {
			/*create a new event for each time interval */
			const replicaEvent = {
				startLocal: LocalTime.toString(moment(startLocal).add(days, 'days')),
				endLocal: LocalTime.toString(moment(endLocal).add(days, 'days')),
				title: instance.data.title,
				description: instance.data.description,
				venue: instance.data.venue,
				room: instance.data.room || '',
				region: instance.data.region,
				groups: instance.data.groups,
				replicaOf: instance.data.replicaOf || instance.data._id, // delegate the same replicaOf ID for this replica if the replicated event is also a replica
			};

			const courseId = instance.data.courseId;
			if (courseId) replicaEvent.courseId = courseId;

			// To create a new event, pass an empty Id
			const eventId = '';
			instance.busy('saving');
			Meteor.call('saveEvent', eventId, replicaEvent, error => {
				instance.busy(false);
				if (error) {
					showServerError('Replicating the event went wrong', error);
				} else {
					const parentInstance = instance.parentInstance();
					parentInstance.replicating.set(false);
					parentInstance.collapse();

					// print success message only if it's the last replica and
					// condense it if multiple replicas have been created
					if (i == replicaDays.length - 1) {
						const fmtDate =
							LocalTime
							.fromString(replicaEvent.startLocal)
							.format('LL');

						const message = mf(
							'event.replicate.successCondensed',
							{ TITLE: replicaEvent.title
							, NUM: replicaDays.length
							, DATE: fmtDate },
							'Cloned event "{TITLE}" {NUM, plural, one {for} other {# times until}} {DATE}'
						);

						addMessage(message, 'success');
					}
				}
			});
		});
	},

	'change .js-update-replicas, keyup .js-update-replicas'(event, instance) {
		instance.calcDays.set(getEventFrequency(instance));
	},

	'mouseover .js-replicate-btn'(event, instance) {
		instance.$('.replica-event-captions').addClass('highlighted');
	},

	'mouseout .js-replicate-btn'(event, instance) {
		instance.$('.replica-event-captions').removeClass('highlighted');
	},

	'click .js-cancel-replication'(event, instance) {
		const parentInstance = instance.parentInstance();
		parentInstance.replicating.set(false);
		parentInstance.collapse();
	}
});
