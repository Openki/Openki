import { i18n } from '/imports/startup/both/i18next';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import moment from 'moment';

import { Regions } from '/imports/api/regions/regions';
import * as Alert from '/imports/api/alerts/alert';
import * as EventsMethods from '/imports/api/events/methods';
import { EventEntity, EventModel } from '/imports/api/events/events';

import { Analytics } from '/imports/ui/lib/analytics';

import './template.html';
import './styles.scss';

{
	const Template = TemplateAny as TemplateStaticTyped<
		'deleteCourseEvents',
		{ onShowEventsDeleteModal: () => void }
	>;

	const template = Template.deleteCourseEvents;

	template.events({
		'mouseover/mouseout .js-show-events-delete-modal'(event, instance) {
			// mouseover/mouseout doesn't get caught on child elements. so we get it
			const caption = instance.$(event.currentTarget as any).children('.event-caption-action');
			caption.toggleClass('placeholder', event.type === 'mouseout');
		},

		'click .js-show-events-delete-modal'(_event, instance) {
			instance.data.onShowEventsDeleteModal();
		},
	});
}

{
	const Template = TemplateAny as TemplateStaticTyped<
		'deleteEventsModal',
		{ upcomingEvents: Mongo.Cursor<EventEntity, EventModel>; onHideEventsDeleteModal: () => void },
		{
			state: ReactiveDict<{
				selectedEvents: EventModel[];
				allEventsSelected: boolean;
				showDeleteConfirm: boolean;
			}>;
		}
	>;

	const template = Template.deleteEventsModal;

	template.onCreated(function () {
		this.busy(false);

		this.state = new ReactiveDict();
		this.state.setDefault({
			selectedEvents: [],
			allEventsSelected: false,
			showDeleteConfirm: false,
		});

		// set allEventsSelected to true if all events are selected
		this.autorun(() => {
			const cursor = Template.currentData().upcomingEvents;
			const allEventsSelected = cursor.count() === this.state.get('selectedEvents')?.length;
			this.state.set({ allEventsSelected });
		});

		// close confirmation dialog if no events are selected
		this.autorun(() => {
			if (this.state.get('showDeleteConfirm')) {
				if (!this.state.get('selectedEvents')?.length) {
					this.state.set('showDeleteConfirm', false);
				}
			}
		});
	});

	template.onRendered(function () {
		this.$('.js-delete-events-modal').modal('show');
	});

	template.helpers({
		isSelected(this: EventModel) {
			return Template.instance()
				.state.get('selectedEvents')
				?.find((e) => e._id === this._id);
		},

		numSelectedEvents() {
			return Template.instance().state.get('selectedEvents')?.length || 0;
		},

		disabledIfNoEventsSelected() {
			if (Template.instance().state.get('selectedEvents')?.length === 0) {
				return 'disabled';
			}
			return '';
		},
	});

	template.events({
		'hidden.bs.modal .js-delete-events-modal'(_event, instance) {
			instance.data.onHideEventsDeleteModal();
		},

		'click .js-toggle-all'(_event, instance) {
			let selectedEvents: EventModel[];
			if (instance.state.get('allEventsSelected')) {
				selectedEvents = [];
			} else {
				selectedEvents = Template.currentData().upcomingEvents.fetch();
			}

			instance.state.set({ selectedEvents });
		},

		'change input[type="checkbox"]'(this: EventModel, event, instance) {
			let selectedEvents = instance.state.get('selectedEvents');

			if (!selectedEvents) {
				throw new Error('Unexpected falsy: selectedEvents');
			}

			if ((event.target as HTMLInputElement).checked) {
				selectedEvents.push(this);
			} else {
				selectedEvents = selectedEvents.filter((e) => e._id !== this._id);
			}

			instance.state.set({ selectedEvents });
		},

		'click .js-show-delete-confirm'(_event, instance) {
			instance.state.set('showDeleteConfirm', true);
		},

		'click .js-deselect-event'(e, instance) {
			const eventId = instance.$(e.target as any).data('event-id');
			const selectedEvents = instance.state.get('selectedEvents');
			if (!selectedEvents) {
				throw new Error('Unexpected falsy: selectedEvents');
			}
			instance.state.set(
				'selectedEvents',
				selectedEvents.filter((event) => event._id !== eventId),
			);
		},

		'click .js-delete-events'(_e, instance) {
			instance.busy('deleting');

			const events = instance.state.get('selectedEvents');
			let removed = 0;
			let responses = 0;
			events?.forEach((event) => {
				EventsMethods.remove(event._id)
					.then(() => {
						removed += 1;
					})
					.catch((err) => {
						const start = moment(event.startLocal).format('llll');
						Alert.serverError(
							err,
							i18n(
								'deleteEventsModal.errWithReason',
								'Could not delete the "{TITLE} ({START})" event.',
								{ TITLE: event.title, START: start },
							),
						);
					})
					.finally(() => {
						responses += 1;
						if (responses === events.length) {
							instance.busy(false);
							instance.state.set('showDeleteConfirm', false);
							if (removed) {
								Alert.success(
									i18n(
										'deleteEventsModal.sucess',
										'{NUM, plural, one{Event was} other{# events were} } successfully deleted.',
										{ NUM: removed },
									),
								);

								Analytics.trackEvent(
									'Events deletions',
									'Events deletions as team',
									Regions.findOne(event.region)?.nameEn,
									removed,
								);
							}
							if (removed === responses) {
								instance.state.set('selectedEvents', []);
								instance.$('.js-delete-events-modal').modal('hide');
							}
						}
					});
			});
		},

		'click .js-cancel'(_event, instance) {
			instance.state.set('showDeleteConfirm', false);
		},
	});
}
