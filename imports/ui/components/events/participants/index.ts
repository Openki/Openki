import { Meteor } from 'meteor/meteor';
import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';

import { EventModel } from '/imports/api/events/events';

import '/imports/ui/components/participant/contact';
import '/imports/ui/components/profile-link';

import MeteorAsync from '/imports/utils/promisify';
import * as UserPrivilegeUtils from '/imports/utils/user-privilege-utils';

import './styles.scss';
import './template.html';

{
	const Template = TemplateAny as TemplateStaticTyped<
		'eventParticipants',
		EventModel,
		{
			increaseBy: number;
			participantsDisplayLimit: ReactiveVar<number>;
			state: ReactiveDict<{
				showModal: boolean;
			}>;
		}
	>;

	const template = Template.eventParticipants;

	template.onCreated(function () {
		const instance = this;

		instance.increaseBy = 10;
		instance.participantsDisplayLimit = new ReactiveVar(this.increaseBy);

		instance.state = new ReactiveDict();

		instance.state.setDefault({
			showModal: false,
		});
	});

	template.onRendered(function () {
		const instance = this;

		instance.autorun(async () => {
			if (instance.state.get('showModal')) {
				await MeteorAsync.defer();
				instance.$('.js-participant-contact-modal-all').modal('show');
			}
		});
	});

	template.helpers({
		howManyEnrolled() {
			const course = Template.instance().data;

			return course.participants?.length || 0;
		},

		howManyFreePlaces() {
			const course = Template.instance().data;
			const occupied = course.participants?.length || 0;
			return course.maxParticipants - occupied;
		},

		canNotifyAll() {
			const { participants } = Template.instance().data;

			if (!(participants && participants.length > 1)) {
				return false;
			}

			if (UserPrivilegeUtils.privilegedTo('admin')) {
				return true;
			}

			const course = Template.instance().data;

			const user = Meteor.user();
			return !!(
				(user && course?.editableBy(user)) ||
				user?.groups.some((g) => course?.groupOrganizers.includes(g))
			);
		},

		sortedParticipants() {
			const instance = Template.instance();
			const { participants } = instance.data;
			const userId = Meteor.userId();
			if (userId && participants?.includes(userId)) {
				const userArrayPosition = participants.indexOf(userId);
				// remove current user form array and read him at index 0
				participants.splice(userArrayPosition, 1); // remove
				participants.splice(0, 0, userId); // read
			}
			return participants?.slice(0, instance.participantsDisplayLimit.get());
		},

		limited() {
			const participantsDisplayLimit = Template.instance().participantsDisplayLimit.get();
			return participantsDisplayLimit && this.participants.length > participantsDisplayLimit;
		},
		hideModal() {
			const instance = Template.instance();
			return () => {
				instance.$('.js-participant-contact-modal-all').modal('hide');
			};
		},
	});

	template.events({
		'click .js-show-more-participants'(_event, instance) {
			const { participantsDisplayLimit } = instance;
			participantsDisplayLimit.set(participantsDisplayLimit.get() + instance.increaseBy);
		},

		'click .js-contact-event-members'() {
			const instance = Template.instance();
			instance.state.set('showModal', false);

			if (instance.state.get('showModal') === true) {
				instance.state.set('showModal', false);
			} else {
				instance.state.set('showModal', true);
			}
		},
	});
}

{
	const Template = TemplateAny as TemplateStaticTyped<
		'eventParticipant',
		{ participant: string; event: EventModel }
	>;

	const template = Template.eventParticipant;

	template.helpers({
		ownUserParticipantClass() {
			const { data } = Template.instance();

			if (data.participant === Meteor.userId()) {
				return 'is-own-user';
			}
			return '';
		},
	});
}
