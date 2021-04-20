// NOTE All dates are in local time unless otherwise noted. Moment doesn't have
// a "timezone-unaware" mode. Thus Momentjs is kept in the belief that the dates
// are all UTC even though we mean local time. The reason for this is that
// the timezone might actually change when a different region is selected. We
// wouldn't want the time or even date field to change because of this switch.

import { Tooltips } from 'meteor/lookback:tooltips';
import { Router } from 'meteor/iron:router';
import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { mf } from 'meteor/msgfmt:core';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var';

import * as Alert from '/imports/api/alerts/alert';
import { Courses } from '/imports/api/courses/courses';
import Events from '/imports/api/events/events';
import { Regions } from '/imports/api/regions/regions';

import SaveAfterLogin from '/imports/ui/lib/save-after-login';
import { Editable } from '/imports/ui/lib/editable';

import AffectedReplicaSelectors from '/imports/utils/affected-replica-selectors';
import LocalTime from '/imports/utils/local-time';

import { Analytics } from '/imports/ui/lib/analytics';
import * as UserPrivilegeUtils from '/imports/utils/user-privilege-utils';

import '/imports/ui/components/buttons/buttons';
import '/imports/ui/components/editable/editable';
import '/imports/ui/components/events/edit-location/event-edit-location';
import '/imports/ui/components/price-policy/price-policy';
import '/imports/ui/components/regions/tag/region-tag';

import './event-edit.html';

Template.eventEdit.onCreated(function () {
	const instance = this;
	instance.busy(false);

	this.state = new ReactiveDict();
	this.state.setDefault(
		{
			updateReplicasInfos: false,
			startDayChanged: false,
			timeChanged: false,
			updateReplicasTime: false,
			updateChangedReplicasTime: false,
		},
	);

	const { courseId } = this.data;
	if (courseId) {
		instance.subscribe('courseDetails', courseId);
	}

	this.subscribe('affectedReplica', Template.currentData()._id);

	instance.parent = instance.parentInstance();
	instance.selectedRegion = new ReactiveVar(instance.data.region || Session.get('region'));
	instance.selectedLocation = new ReactiveVar(instance.data.venue || {});

	// Sending an event notification is only possible when the event is
	// attached to a course. Otherwise there is nobody to inform.
	const notifyPreset = courseId && instance.data.new;
	instance.notifyChecked = new ReactiveVar(notifyPreset);

	instance.editableDescription = new Editable(
		false,
		mf('event.description.placeholder', 'Describe your event as accurately as possible. This helps people to know how to prepare and what to expect from this meeting (eg. level, prerequisites, activities, teaching methods, what to bring, et cetera)'),
	);

	instance.autorun(() => {
		const data = Template.currentData();
		data.editableDescription = instance.editableDescription;
		instance.editableDescription.setText(data.description);
	});

	/** Get current local time depending on selected region
	  * Returned as faux-UTC moment-object. */
	instance.now = function () {
		return LocalTime.nowFauxUTC(instance.selectedRegion.get());
	};
});

/**
 * @param {string} dateStr
 * @param {string} timeStr
 */
const readDateTime = function (dateStr, timeStr) {
	return moment.utc(`${dateStr} ${timeStr}`, 'L LT');
};


const getEventStartMoment = function (template) {
	return readDateTime(
		template.$('.js-event-start-date').val(),
		template.$('.js-event-start-time').val(),
	);
};


const getEventEndMoment = function (template) {
	const startMoment = getEventStartMoment(template);
	let endMoment = readDateTime(
		startMoment.format('L'),
		template.$('.js-event-end-time').val(),
	);

	// If the end time is earlier than the start time, assume the event
	// spans into the next day. This might result in some weird behavior
	// around hour-lapses due to DST (where 1:30 may be 'later' than 2:00).
	// Well maybe you shouldn't schedule your events to start or end
	// in these politically fucked hours.
	if (endMoment.diff(startMoment) < 0) {
		endMoment = readDateTime(
			startMoment.add(1, 'day').format('L'),
			template.$('.js-event-end-time').val(),
		);
	}

	return endMoment;
};


const getEventDuration = function (template) {
	const duration = parseInt(template.$('.js-event-duration').val(), 10);
	return Math.max(0, duration);
};


/* Patch the end time and the duration when start, end or duration changes */
function updateTimes(template, updateEnd) {
	const start = getEventStartMoment(template);
	let end = getEventEndMoment(template);
	let duration = getEventDuration(template);
	if (!start.isValid() || !end.isValid()) {
		// If you put into the machine wrong figures, will the right answers come out?
		return;
	}

	if (updateEnd) {
		end = moment(start).add(duration, 'minutes');
	}

	if (end.isBefore(start)) {
		// Let sanity prevail
		end = start;
		duration = 0;
	}

	duration = end.diff(start, 'minutes');
	template.$('.js-event-start-date').val(start.format('L'));
	template.$('.js-event-start-time').val(start.format('LT'));
	template.$('.js-event-end-time').val(end.format('LT'));
	template.$('.js-event-duration').val(duration.toString());
}

/**
 * validates input for maxParticipants
 * @param {String} maxParticipants - the user-input
 * @return - an integer if the input passed validation.
 */
const validateMaxParticipants = (maxParticipants) => {
	const intVal = parseInt(maxParticipants, 10);
	/* eslint-disable-next-line eqeqeq */
	if (intVal != maxParticipants) {
		Alert.error(mf('event.edit.mustBeInteger', 'Number must be integer'));
		return false;
	}
	if (intVal < 0) {
		Alert.error(mf('event.edit.mustBePositive', 'Number must be positive'));
		return false;
	}
	return intVal;
};


Template.eventEdit.onRendered(function () {
	const instance = this;
	updateTimes(instance, false);

	instance.autorun(() => {
		// Depend on locale so we update reactively when it changes
		Session.get('locale');

		const $dateInput = instance.$('.js-event-start-date');

		// remove, re-add the datepicker when the locale changed
		$dateInput.datepicker('destroy');

		// I don't know why, but language: moment.locale() does not work here.
		// So instead we clobber the 'en' settings with settings for the
		// selected language.
		$dateInput.datepicker({
			weekStart: moment.localeData().firstDayOfWeek(),
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
	});
});


Template.eventEdit.helpers({

	hasParentCourse() {
		return Boolean(this.courseId);
	},

	showRegionTag() {
		if (!this._id || this.courseId) {
			return false;
		}
		return true;
	},

	localDate(date) {
		return moment.utc(date).format('L');
	},

	affectedReplicaCount() {
		return Events.find(AffectedReplicaSelectors(this)).count();
	},

	disabledIfDayChanged() {
		if (Template.instance().state.get('startDayChanged')) {
			return 'disabled';
		}
		return '';
	},

	startDayChanged() {
		return Template.instance().state.get('startDayChanged');
	},

	timeChanged() {
		return Template.instance().state.get('timeChanged');
	},

	changedReplicas() {
		return (
			Events
				.find(AffectedReplicaSelectors(this))
				.fetch()
				.filter((replica) => !replica.sameTime(this))
		);
	},

	emphasizeClass() {
		if (Template.instance().state.get('updateReplicasTime')) {
			return 'is-emphasized';
		}
		return '';
	},

	updateChangedReplicasTime() {
		return Template.instance().state.get('updateChangedReplicasTime');
	},

	regions() {
		return Regions.find();
	},

	showRegionSelection() {
		// You can select the region for events that are new and not associated
		// with a course
		if (this._id || this.courseId) {
			return false;
		}
		return true;
	},

	showVenueSelection() {
		const selectedRegion = Template.instance().selectedRegion.get();
		return selectedRegion && selectedRegion !== 'all';
	},

	disableForPast() {
		return this.startUTC && this.startUTC < new Date() ? 'disabled' : '';
	},

	isInternal() {
		return this.internal ? 'checked' : null;
	},

	uploaded() {
		return Template.instance().uploaded.get();
	},

	course() {
		const { courseId } = this;
		if (courseId) {
			return Courses.findOne({ _id: courseId });
		}
		return false;
	},
	maxParticipants() {
		// show empty input instead of 0
		return this.maxParticipants || '';
	},
	notifyChecked() {
		return Template.instance().notifyChecked.get();
	},
});


Template.eventEdit.events({
	submit(event, instance) {
		event.preventDefault();

		const start = getEventStartMoment(instance);
		if (!start.isValid()) {
			const exampleDate = moment().format('L');
			Alert.serverError(
				mf(
					'event.edit.dateFormatWarning',
					{ EXAMPLEDATE: exampleDate },
					'Date format must be of the form {EXAMPLEDATE}',
				),
			);
			return;
		}
		const end = getEventEndMoment(instance);

		const editevent = {
			title: instance.$('.js-event-title').val(),
			venue: instance.selectedLocation.get(),
			room: instance.$('.js-event-room').val(),
			startLocal: LocalTime.toString(start),
			endLocal: LocalTime.toString(end),
			internal: instance.$('.js-check-event-internal').is(':checked'),
			maxParticipants: validateMaxParticipants(instance.$('.js-event-max-participants').val() || 0),
		};

		// validation was unsuccessful
		if (editevent.maxParticipants === false) {
			return;
		}

		if (editevent.title.length === 0) {
			Alert.error(mf('event.edit.plzProvideTitle', 'Please provide a title'));
			return;
		}

		const newDescription = instance.data.editableDescription.getEdited();
		if (newDescription) {
			editevent.description = newDescription;
		}

		if (!editevent.description) {
			Alert.error(mf('event.edit.plzProvideDescr', 'Please provide a description'));
			return;
		}

		const eventId = this._id || '';
		const isNew = eventId === '';
		if (isNew) {
			if (this.courseId) {
				const course = Courses.findOne(this.courseId);
				editevent.region = course.region;
				editevent.courseId = this.courseId;
			} else {
				editevent.region = instance.selectedRegion.get();
				if (!editevent.region || editevent.region === 'all') {
					Alert.error(
						mf('event.edit.plzSelectRegion', 'Please select the region for this event'),
					);
					return;
				}

				// We have this 'secret' feature where you can set a group ID
				// in the URL to assign a group to the event on creation
				const groups = [];
				if (Router.current().params.query.group) {
					groups.push(Router.current().params.query.group);
				}
				editevent.groups = groups;
			}
		}

		const updateReplicasInfos = instance.state.get('updateReplicasInfos');
		const updateReplicasTime = !instance.state.get('startDayChanged') && instance.state.get('timeChanged') && instance.state.get('updateReplicasTime');
		const updateChangedReplicasTime = updateReplicasTime && instance.state.get('updateChangedReplicasTime');
		const sendNotifications = instance.$('.js-check-notify').is(':checked');
		const addNotificationMessage = instance.$('.js-event-add-message').val();

		instance.busy('saving');
		SaveAfterLogin(instance,
			mf('loginAction.saveEvent', 'Login and save event'),
			mf('registerAction.saveEvent', 'Register and save event'),
			() => {
				Meteor.call('event.save',
					{
						eventId,
						updateReplicasInfos,
						updateReplicasTime,
						updateChangedReplicasTime,
						sendNotifications,
						changes: editevent,
						comment: addNotificationMessage,
					},
					/* eslint-disable-next-line no-shadow */
					(err, eventId) => {
						instance.busy(false);
						if (err) {
							Alert.serverError(err, 'Saving the event went wrong');
						} else {
							if (isNew) {
								Router.go('showEvent', { _id: eventId });
								Alert.success(mf(
									'message.eventCreated',
									{ TITLE: editevent.title },
									'The event "{TITLE}" has been created!',
								));

								const course = Courses.findOne(editevent.courseId);
								let role;
								if (_.intersection(Meteor.user().badges, course.editors).length > 0) {
									role = 'team';
								} else if (UserPrivilegeUtils.privilegedTo('admin')) {
									role = 'admin';
								} else {
									role = 'unknown';
								}
								Analytics.trackEvent('Event creations',
									`Event creations as ${role}`,
									Regions.findOne(course.region)?.nameEn,
									Math.round((new Date() - course.time_created)
										/ 1000 / 60 / 60 / 24 /* Umrechnung in Tage */));
							} else {
								Alert.success(mf(
									'message.eventChangesSaved',
									{ TITLE: editevent.title },
									'Your changes to the event "{TITLE}" have been saved.',
								));
							}

							if (updateReplicasInfos || updateReplicasTime) {
								Alert.success(mf(
									'eventEdit.replicatesUpdated',
									{ TITLE: editevent.title },
									'The replicas of "{TITLE}" have also been updated.',
								));
							}
							instance.parent.editing.set(false);
						}
					});
			});
	},

	'click .js-event-cancel'(event, instance) {
		if (instance.data.new) {
			window.history.back();
		}
		instance.parent.editing.set(false);
	},

	'click .js-toggle-duration'() {
		Tooltips.hide();
		$('.time-end > *').toggle();
	},

	'click .js-check-notify'(event, instance) {
		instance.notifyChecked.set(instance.$('.js-check-notify').is(':checked'));
	},

	'change .js-event-start-date'(event, instance) {
		const newDate = instance.$(event.target).val();
		instance.state.set({
			startDayChanged: !moment(newDate, 'L').isSame(this.startLocal, 'day'),
		});
	},

	'change .js-event-duration, change .js-event-start-date, change .js-event-start-time'(event, instance) {
		updateTimes(instance, true);
		const newStart = getEventStartMoment(instance);
		const newEnd = getEventEndMoment(instance);
		instance.state.set({
			timeChanged: !(newStart.isSame(moment.utc(this.startLocal), 'minute') && newEnd.isSame(moment.utc(this.endLocal), 'minute')),
		});
	},

	'change .js-event-end-time'(event, instance) {
		updateTimes(instance, false);
		const newStart = getEventStartMoment(instance);
		const newEnd = getEventEndMoment(instance);
		instance.state.set({
			timeChanged: !(newStart.isSame(moment.utc(this.startLocal), 'minute') && newEnd.isSame(moment.utc(this.endLocal), 'minute')),
		});
	},

	'change .js-select-region'(event, instance) {
		instance.selectedRegion.set(instance.$('.js-select-region').val());
	},

	'change .js-update-replicas-infos'(event, instance) {
		instance.state.set('updateReplicasInfos', event.target.checked);
	},

	'change .js-update-replicas-time'(event, instance) {
		instance.state.set('updateReplicasTime', event.target.checked);
	},

	'change .js-update-changed-replicas-time'(event, instance) {
		instance.state.set('updateChangedReplicasTime', event.target.checked);
	},
});
