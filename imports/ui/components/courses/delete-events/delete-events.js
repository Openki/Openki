import { Meteor } from 'meteor/meteor';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Template } from 'meteor/templating';

import { AddMessage } from '/imports/api/messages/methods.js';

import './delete-events.html';

Template.deleteCourseEvents.events({
	'mouseover/mouseout .js-show-events-delete-modal'(event, instance) {
		// mouseover/mouseout doesn't get caught on child elements. so we get it
		const caption = instance.$(event.currentTarget).children('.event-caption-action');
		caption.toggleClass('placeholder', event.type === 'mouseout');
	},

	'click .js-show-events-delete-modal'(event, instance) {
		instance.parentInstance().showModal.set(true);
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

	// set allEventsSelected to true if all events are selected
	this.autorun(() => {
		const cursor = Template.currentData().upcomingEvents;
		const allEventsSelected = cursor.count() === this.state.get('selectedEvents').length;
		this.state.set({ allEventsSelected });
	});

	// close confirmation dialog if no events are selected
	this.autorun(() => {
		if (this.state.get('showDeleteConfirm')) {
			if (!this.state.get('selectedEvents').length) {
				this.state.set('showDeleteConfirm', false);
			}
		}
	});
});

Template.deleteEventsModal.onRendered(function() {
	this.$('#deleteEventsModal').modal('show');
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
	'hidden.bs.modal #deleteEventsModal'(event, instance) {
		instance.parentInstance().showModal.set(false);
	},

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

	'click .js-deselect-event'(e, instance) {
		const eventId = instance.$(e.target).data('event-id');
		const selectedEvents = instance.state.get('selectedEvents');
		instance.state.set('selectedEvents', selectedEvents.filter((event) => event._id !== eventId));
	},

	'click .js-delete-events'(e, instance) {
		instance.busy('deleting');

		const events = instance.state.get('selectedEvents');
		let removed = 0;
		let responses = 0;
		events.forEach((event, index) => {
			Meteor.call('event.remove', event._id, (err) => {
				responses++;
				if (err) {
					AddMessage(mf(
						'deleteEventsModal.errWithReason',
						{ REASON: err.reason || 'Unknown error'
						, TITLE: event.title
						, START: moment(event.startLocal).format('llll')
						},
						'Deleting the event "{TITLE} ({START})" failed: "{REASON}"'
					), 'danger');
				} else {
					removed++;
				}

				if (responses === events.length) {
					instance.busy(false);
					instance.state.set('showDeleteConfirm', false);
					if (removed) {
						AddMessage(mf(
							'deleteEventsModal.sucess',
							{ NUM: removed },
							'{NUM, plural, one {Event was} other {# events were}} successfully deleted.'
						), 'success');
					}
					if (removed === responses) {
						instance.state.set('selectedEvents', []);
						instance.$('#deleteEventsModal').modal('hide');
					}
				}
			});
		});
	},

	'click .js-cancel'(event, instance) {
		instance.state.set('showDeleteConfirm', false);
	}
});
