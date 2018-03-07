import { Meteor } from 'meteor/meteor';
import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';

import Events from '/imports/api/events/events.js';

import { AddMessage } from '/imports/api/messages/methods.js';

import '/imports/ui/components/events/list/event-list.js';
import '/imports/ui/components/loading/loading.js';

import './course-events.html';

Template.courseEvents.onCreated(function() {
	var instance = this;
	var courseId = this.data.course._id;

	instance.eventSub = subs.subscribe('eventsForCourse', courseId);

	var maxEventsShown = 4;
	instance.showAllEvents = new ReactiveVar(false);

	instance.haveEvents = function() {
		return Events.findFilter({ course: courseId, start: minuteTime.get() }).count() > 0;
	};

	instance.haveMoreEvents = function() {
		return Events.findFilter({ course: courseId, start: minuteTime.get() }).count() > maxEventsShown;
	};

	instance.ongoingEvents = function() {
		return Events.findFilter({ course: courseId, ongoing: minuteTime.get() });
	};

	instance.futureEvents = function() {
		var limit = instance.showAllEvents.get() ? 0 : maxEventsShown;

		return Events.findFilter({ course: courseId, after: minuteTime.get() }, limit);
	};
});

Template.courseEvents.helpers({
	mayAdd: function() {
		return this.course.editableBy(Meteor.user());
	},

	haveEvents: function() {
		return Template.instance().haveEvents();
	},

	ongoingEvents: function() {
		return Template.instance().ongoingEvents();
	},

	haveOngoingEvents: function() {
		return Template.instance().ongoingEvents().count() > 0;
	},

	futureEvents: function() {
		return Template.instance().futureEvents();
	},

	haveFutureEvents: function() {
		return Template.instance().futureEvents().count() > 0;
	},

	haveMoreEvents: function() {
		var instance = Template.instance();
		return instance.haveMoreEvents() && (!instance.showAllEvents.get());
	},

	ready: function() {
		return Template.instance().eventSub.ready();
	}
});

Template.courseEvents.events({
	'click .js-show-all-events': function () {
		Template.instance().showAllEvents.set(true);
	},

	'scroll .js-scrollable-container': function(event, instance) {
		var scrollableContainer = instance.$('.js-scrollable-container');

		// Use dom element to get true height of clipped div
		// https://stackoverflow.com/questions/4612992/get-full-height-of-a-clipped-div#5627286
		var trueHeight = scrollableContainer[0].scrollHeight;
		var visibleHeight = scrollableContainer.height();

		// Compute height and subtract a possible deviation
		var computedHeight = trueHeight - visibleHeight - 1;

		instance.$(".fade-top ").fadeIn(200);

		if (scrollableContainer.scrollTop() === 0) {
			instance.$(".fade-top").fadeOut(200);
		} else if (scrollableContainer.scrollTop() >= computedHeight) {
			instance.$(".fade-bottom").fadeOut(200);
		} else {
			instance.$(".fade-top").fadeIn(200);
			instance.$(".fade-bottom").fadeIn(200);
		}
	}
});

Template.courseEventAdd.helpers({
	addEventQuery: function() {
		return 'courseId=' + this.course._id;
	}
});

Template.courseEventAdd.onRendered(function() {
	var instance = this;
	var eventCaption = instance.$('.event-caption-add');

	function toggleCaptionClass(e) {
		var removeClass = e.type == 'mouseout';
		eventCaption.toggleClass('placeholder', removeClass);
	}

	eventCaption.on('mouseover mouseout', function(e) { toggleCaptionClass(e); });
	instance.$('.event-caption-add-text').on('mouseover mouseout', function(e) { toggleCaptionClass(e); });
});

Template.deleteCourseEvents.helpers({
	upcomingEvents() {
		return Events.findFilter(
			{ course: this.course._id
			, after: minuteTime.get()
			}
		);
	}
});

Template.deleteCourseEvents.events({
	'click .js-show-events-delete-modal'(event, instance) {
		instance.$('#deleteEventsModal').modal('show');
	}
});

Template.deleteEventsModal.onCreated(function() {
	this.busy(false);

	this.state = new ReactiveDict();
	this.state.setDefault(
		{ selectedEvents: []
		, allEventsSelected: false
		, showDeleteConfirm: false
		}
	);

	this.autorun(() => {
		const cursor = Template.currentData().upcomingEvents;
		const allEventsSelected = cursor.count() === this.state.get('selectedEvents').length;
		this.state.set({ allEventsSelected });
	});
});

Template.deleteEventsModal.helpers({
	selectedEvents() {
		return Template.instance().state.get('selectedEvents');
	},

	isSelected() {
		return Template.instance().state.get('selectedEvents').find(e => e._id === this._id);
	},

	numSelectedEvents() {
		return Template.instance().state.get('selectedEvents').length;
	},

	disabledIfNoEventsSelected() {
		if (Template.instance().state.get('selectedEvents').length === 0) {
			return 'disabled';
		}
	}
});

Template.deleteEventsModal.events({
	'click .js-toggle-all'(event, instance) {
		let selectedEvents;
		if (instance.state.get('allEventsSelected')) {
			selectedEvents = [];
		} else {
			selectedEvents = Template.currentData().upcomingEvents.fetch();
		}

		instance.state.set({ selectedEvents });
	},

	'change input[type="checkbox"]'(event, instance) {
		let selectedEvents = instance.state.get('selectedEvents');
		if (event.target.checked) {
			selectedEvents.push(this);
		} else {
			selectedEvents = selectedEvents.filter(e => e._id !== this._id);
		}

		instance.state.set({ selectedEvents });
	},

	'click .js-show-delete-confirm'(event, instance) {
		instance.state.set('showDeleteConfirm', true);
	},

	'click .js-delete-events'(e, instance) {
		instance.busy('deleting');
		instance.state.get('selectedEvents').forEach((event, index, list) => {
			Meteor.call('event.remove', event._id, (err) => {
				if (index === list.length - 1) {
					if (err) {
						AddMessage(err.reason || 'Unknown error', 'danger');
					} else {
						AddMessage(mf(
							'deleteEventsModal.sucess',
							{ NUM: list.length },
							'{NUM, plural, one {Event was} other {# events were}} successfully deleted.'
						), 'success');
					}

					instance.busy(false);
					instance.state.set(
						{ selectedEvents: []
						, showDeleteConfirm: false
						}
					);
					instance.$('#deleteEventsModal').modal('hide');
				}
			});
		});
	},

	'click .js-cancel'(event, instance) {
		instance.state.set('showDeleteConfirm', false);
	}
});
