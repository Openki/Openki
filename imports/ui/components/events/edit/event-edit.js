// NOTE All dates are in local time unless otherwise noted. Moment doesn't have
// a "timezone-unaware" mode. Thus Momentjs is kept in the belief that the dates
// are all UTC even though we mean local time. The reason for this is that
// the timezone might actually change when a different region is selected. We
// wouldn't want the time or even date field to change because of this switch.

import { ReactiveDict } from 'meteor/reactive-dict';

import LocalTime from '/imports/utils/local-time.js';
import Editable from '/imports/ui/lib/editable.js';
import SaveAfterLogin from '/imports/ui/lib/save-after-login.js';
import ShowServerError from '/imports/ui/lib/show-server-error.js';
import Regions from '/imports/api/regions/regions.js';

import Courses from '/imports/api/courses/courses.js';
import Events from '/imports/api/events/events.js';
import '/imports/ui/components/buttons/buttons.js';
import '/imports/ui/components/editable/editable.js';
import '/imports/ui/components/events/edit-location/event-edit-location.js';
import '/imports/ui/components/price-policy/price-policy.js';
import '/imports/ui/components/regions/tag/region-tag.js';

import AffectedReplicaSelectors from '/imports/utils/affected-replica-selectors.js';
import { AddMessage } from '/imports/api/messages/methods.js';

import './event-edit.html';

Template.eventEdit.onCreated(function() {
	var instance = this;
	instance.busy(false);

	this.state = new ReactiveDict();
	this.state.setDefault(
		{ updateReplicas: false
		, updateChangedReplicas: false
		, startDayChanged: false
		}
	);

	var courseId = this.data.courseId;
	if (courseId) {
		instance.subscribe('courseDetails', courseId);
	}

	this.subscribe('affectedReplica', Template.currentData()._id);

	instance.parent = instance.parentInstance();
	instance.selectedRegion = new ReactiveVar(instance.data.region || Session.get('region'));
	instance.selectedLocation = new ReactiveVar(instance.data.venue || {});

	// Sending an event notification is only possible when the event is
	// attached to a course. Otherwise there is nobody to inform.
	var notifyPreset = courseId && instance.data.new;
	instance.notifyChecked = new ReactiveVar(notifyPreset);

	instance.editableDescription = new Editable(
		false,
		false,
		mf('event.description.placeholder', 'Describe your event as accurately as possible. This helps people to know how to prepare and what to expect from this meeting (eg. level, prerequisites, activities, teaching methods, what to bring, et cetera)'),
		false
	);

	instance.autorun(function() {
		var data = Template.currentData();
		data.editableDescription = instance.editableDescription;
		instance.editableDescription.setText(data.description);
	});

	/** Get current local time depending on selected region
	  * Returned as faux-UTC moment-object. */
	instance.now = function() {
		return LocalTime.nowFauxUTC(instance.selectedRegion.get());
	};
});


var readDateTime = function(dateStr, timeStr) {
	return moment.utc(dateStr+' '+timeStr, 'L LT');
};


var getEventStartMoment = function(template) {
	return readDateTime(
		template.$('.js-event-start-date').val(),
		template.$('#editEventStartTime').val()
	);
};


var getEventEndMoment = function(template) {
	var startMoment = getEventStartMoment(template);
	var endMoment = readDateTime(
		startMoment.format('L'),
		template.$('#editEventEndTime').val()
	);

	// If the end time is earlier than the start time, assume the event
	// spans into the next day. This might result in some weird behavior
	// around hour-lapses due to DST (where 1:30 may be 'later'	than 2:00).
	// Well maybe you shouldn't schedule your events to start or end
	// in these politically fucked hours.
	if (endMoment.diff(startMoment) < 0) {
		endMoment = readDateTime(
			startMoment.add(1, 'day').format('L'),
			template.$('#editEventEndTime').val()
		);
	}

	return endMoment;
};


var getEventDuration = function(template) {
	var duration = parseInt(template.$('#editEventDuration').val(), 10);
	return Math.max(0,duration);
};


/* Patch the end time and the duration when start, end or duration changes */
function updateTimes(template, updateEnd) {
	var start = getEventStartMoment(template);
	var end = getEventEndMoment(template);
	var duration = getEventDuration(template);
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
	template.$('#edit_event_startdate').val(start.format('L'));
	template.$('#editEventStartTime').val(start.format('LT'));
	template.$('#editEventEndTime').val(end.format('LT'));
	template.$('#editEventDuration').val(duration.toString());
}


Template.eventEdit.onRendered(function() {
	var instance = this;
	updateTimes(instance, false);

	instance.autorun(function() {
		// Depend on locale so we update reactively when it changes
		Session.get('locale');

		var $dateInput = instance.$('.js-event-start-date');

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
				toDisplay: function(date) {
					return moment.utc(date).format('L');
				},
				toValue: function(date) {
					return moment.utc(date, 'L').toDate();
				}
			}
		});
	});
});


Template.eventEdit.helpers({

	hasParentCourse: function() {
		return !! this.courseId;
	},

	showRegionTag() {
		if (this.courseId) return false;
		if (!this._id) return false;
		return true;
	},

	localDate: function(date) {
		return moment.utc(date).format("L");
	},

	affectedReplicaCount: function() {
		return Events.find(AffectedReplicaSelectors(this)).count();
	},

	disabledIfDayChanged() {
		if (Template.instance().state.get('startDayChanged')) return 'disabled';
	},

	startDayChanged() {
		return Template.instance().state.get('startDayChanged');
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
		return Template.instance().state.get('updateReplicas') && 'is-emphasized';
	},

	updateChangedReplicas() {
		return Template.instance().state.get('updateChangedReplicas');
	},

	regions: function(){
		return Regions.find();
	},

	showRegionSelection: function() {
		// You can select the region for events that are new and not associated
		// with a course
		if (this._id) return false;
		if (this.courseId) return false;
		return true;
	},

	currentRegion: function(region) {
		var currentRegion = Session.get('region');
		return currentRegion && region._id == currentRegion;
	},

	showVenueSelection: function(region) {
		var selectedRegion = Template.instance().selectedRegion.get();
		return selectedRegion && selectedRegion !== 'all';
	},

	disableForPast: function() {
		return this.startUTC && this.startUTC < new Date() ? 'disabled' : '';
	},

	isInternal: function() {
		return this.internal ? "checked" : null;
	},

	uploaded: function() {
		return Template.instance().uploaded.get();
	},

	course: function() {
		var courseId = this.courseId;
		if (courseId) {
			return Courses.findOne({_id: courseId});
		}
	},
	notifyChecked: function() {
		return Template.instance().notifyChecked.get();
	}
});


Template.eventEdit.events({
	'submit': function(event, instance) {
		event.preventDefault();

		const start = getEventStartMoment(instance);
		if(!start.isValid()) {
			const exampleDate = moment().format('L');
			alert(mf('event.edit.dateFormatWarning', { EXAMPLEDATE: exampleDate }, "Date format must be of the form {EXAMPLEDATE}"));
			return;
		}
		const end = getEventEndMoment(instance);

		const editevent = {
			title: instance.$('#eventEditTitle').val(),
			venue: instance.selectedLocation.get(),
			room: instance.$('#eventEditRoom').val(),
			startLocal: LocalTime.toString(start),
			endLocal:   LocalTime.toString(end),
			internal: instance.$('.js-check-event-internal').is(':checked'),
		};

		if (editevent.title.length === 0) {
			alert(mf('event.edit.plzProvideTitle', "Please provide a title"));
			return;
		}

		const newDescription = instance.data.editableDescription.getEdited();
		if (newDescription) editevent.description = newDescription;

		if (!editevent.description) {
			alert(mf('event.edit.plzProvideDescr', "Please provide a description"));
			return;
		}

		const eventId = this._id ? this._id : '';
		const isNew = eventId === '';
		if (isNew) {
			if (this.courseId) {
				const course = Courses.findOne(this.courseId);
				editevent.region = course.region;
				editevent.courseId = this.courseId;
			} else {
				editevent.region = instance.selectedRegion.get();
				if (!editevent.region || editevent.region === 'all') {
					alert(mf('event.edit.plzSelectRegion', "Please select the region for this event"));
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

		const updateReplicas = instance.state.get('updateReplicas');
		const updateChangedReplicas = instance.state.get('updateChangedReplicas');
		const sendNotifications = instance.$(".js-check-notify").is(':checked');
		const addNotificationMessage = instance.$(".js-event-edit-add-message").val();

		instance.busy('saving');
		SaveAfterLogin(instance, mf('loginAction.saveEvent', 'Login and save event'), () => {
			Meteor.call('event.save',
			{
				eventId,
				updateReplicas,
				updateChangedReplicas,
				sendNotifications,
				changes: editevent,
				comment: addNotificationMessage
			},
			(err, eventId) => {
				instance.busy(false);
				if (err) {
					ShowServerError('Saving the event went wrong', err);
				} else {
					if (isNew) {
						Router.go('showEvent', { _id: eventId });
						AddMessage("\u2713 " + mf('_message.saved'), 'success');
					} else {
						AddMessage("\u2713 " + mf('_message.saved'), 'success');
					}

					if (updateReplicas) {
						AddMessage(mf('event.edit.replicates.success', { TITLE: editevent.title }, 'Replicas of "{TITLE}" also updated.'), 'success');
					}
					instance.parent.editing.set(false);
				}
			});
		});
	},

	'click .js-event-edit-cancel': function (event, instance) {
		if (instance.data.new) history.back();
		instance.parent.editing.set(false);
	},

	'click .js-toggle-duration': function(event, instance){
		Tooltips.hide();
		$('.time-end > *').toggle();
	},

	'click .js-check-notify': function(event, instance){
		instance.notifyChecked.set(instance.$(".js-check-notify").is(':checked'));
	},

	'change .js-event-start-date'(event, instance) {
		const newDate = instance.$(event.target).val();
		instance.state.set({
			startDayChanged: ! moment(newDate, 'L').isSame(this.startLocal, 'day')
		});
	},

	'change #editEventDuration, change .js-event-start-date, change #editEventStartTime': function(event, template) {
		updateTimes(template, true);
	},

	'change #editEventEndTime': function(event, template) {
		updateTimes(template, false);
	},

	'change .js-select-region': function(event, instance) {
		instance.selectedRegion.set(instance.$('.js-select-region').val());
	},

	'change .js-update-replicas'(event, instance) {
		instance.state.set('updateReplicas', event.target.checked);
	},

	'change .js-update-changed-replicas'(event, instance) {
		instance.state.set('updateChangedReplicas', event.target.checked);
	}
});
