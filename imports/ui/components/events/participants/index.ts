import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';

import { EventModel } from '/imports/api/events/events';

import '/imports/ui/components/participant/contact';
import '/imports/ui/components/profile-link';

import './template.html';
import './styles.scss';

{
	const Template = TemplateAny as TemplateStaticTyped<
		'eventParticipants',
		EventModel,
		{ increaseBy: number; participantsDisplayLimit: ReactiveVar<number> }
	>;

	const template = Template.eventParticipants;

	template.onCreated(function () {
		const instance = this;

		instance.increaseBy = 10;
		instance.participantsDisplayLimit = new ReactiveVar(this.increaseBy);
	});

	template.helpers({
		howManyEnrolled() {
			const { data } = Template.instance();

			return data.participants?.length || 0;
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
	});

	template.events({
		'click .js-show-more-participants'(_event, instance) {
			const { participantsDisplayLimit } = instance;
			participantsDisplayLimit.set(participantsDisplayLimit.get() + instance.increaseBy);
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
