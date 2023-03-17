import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';
import { i18n } from '/imports/startup/both/i18next';
import { Meteor } from 'meteor/meteor';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';

import * as Alert from '/imports/api/alerts/alert';
import { Courses } from '/imports/api/courses/courses';
import { EventModel } from '/imports/api/events/events';
import * as EventsMethods from '/imports/api/events/methods';
import { Regions } from '/imports/api/regions/regions';

import { LocationTracker } from '/imports/ui/lib/location-tracker';
import * as TemplateMixins from '/imports/ui/lib/template-mixins';

import { getLocalizedValue } from '/imports/utils/getLocalizedValue';

import * as Analytics from '/imports/ui/lib/analytics';

import '/imports/ui/components/buttons';
import '/imports/ui/components/courses/categories';
import '/imports/ui/components/events/display/course-header';
import '/imports/ui/components/events/display/header';
import '/imports/ui/components/events/edit';
import '/imports/ui/components/events/participants';
import '/imports/ui/components/events/replication';
import '/imports/ui/components/events/display/group-list';
import '/imports/ui/components/groups/tag';
import '/imports/ui/components/price-policy';
import '/imports/ui/components/regions/tag';
import '/imports/ui/components/sharing';
import '/imports/ui/components/report';
import '/imports/ui/components/venues/link';
import '/imports/ui/components/internal-indicator';
import '/imports/ui/components/delete-confirm-dialog';
import type { Props as DeleteConfirmDialogProps } from '/imports/ui/components/delete-confirm-dialog';

import './template.html';
import './styles.scss';

{
	const Template = TemplateMixins.Expandible(
		TemplateAny as TemplateStaticTyped<
			'eventDisplay',
			EventModel,
			{ locationTracker: LocationTracker; replicating: ReactiveVar<boolean> }
		>,
		'eventDisplay',
	);

	const template = Template.eventDisplay;

	template.onCreated(function () {
		const instance = this;
		instance.locationTracker = new LocationTracker();
		instance.replicating = new ReactiveVar(false);
	});

	template.onRendered(function () {
		const instance = this;
		instance.locationTracker.setRegion(instance.data.region);
		instance.locationTracker.setLocation(instance.data.venue);
	});

	template.helpers({
		mayEdit() {
			return this.editableBy(Meteor.user());
		},
		eventMarkers() {
			return Template.instance().locationTracker.markers;
		},
		hasVenue(this: EventModel) {
			return this.venue?.loc;
		},
		replicating() {
			return Template.instance().replicating.get();
		},
		customFields() {
			if (!this.courseId) {
				return [];
			}
			const course = Courses.findOne(this.courseId);

			if (!course) {
				return [];
			}

			const user = Meteor.user();

			const isEditor = user && course.editableBy(user);

			return (
				course.customFields
					?.filter((i) => i.visibleFor === 'all' || (i.visibleFor === 'editors' && isEditor))
					.map((i) => ({
						displayText: getLocalizedValue(i.displayText),
						value: i.value,
					})) || []
			);
		},
		deleteConfirmDialogAttr(): DeleteConfirmDialogProps {
			const instance = Template.instance();
			return {
				confirmText: i18n(
					'event.reallydelete',
					'Please confirm that you would like to delete this event. This might confuse other users and cannot be undone.',
				),
				confirmButton: i18n('event.delete.confirm.button', 'Delete this event'),
				busyButton: i18n('event.delete.confirm.button.busy', 'Deleting event…'),
				onRemove: async () => {
					const oEvent = instance.data;
					const { title, region } = oEvent;
					const course = oEvent.courseId;

					(instance.parentInstance() as any).editing.set(false);
					try {
						await EventsMethods.remove(oEvent._id);

						Alert.success(
							i18n('eventDetails.eventRemoved', 'The "{TITLE}" event has been deleted.', {
								TITLE: title,
							}),
						);

						Analytics.trackEvent(
							'Event deletions',
							'Event deletions as team',
							Regions.findOne(region)?.nameEn,
						);

						if (course) {
							Router.go('showCourse', { _id: course });
						} else {
							Router.go('/');
						}
					} catch (err) {
						Alert.serverError(
							err,
							i18n('eventDetails.eventRemoved.error', 'Could not remove event'),
						);
					}
				},
				onCancel: async () => {
					Session.set('verify', false);
				},
			};
		},
	});

	template.events({
		'click .js-show-replication'(_event, instance) {
			instance.replicating.set(true);
			instance.collapse();
		},

		'click .js-track-cal-download'(_event, instance) {
			Analytics.trackEvent(
				'Events downloads',
				'Event downloads via event details',
				Regions.findOne(instance.data.region)?.nameEn,
			);
		},
	});
}
