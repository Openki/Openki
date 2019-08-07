import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';

import '/imports/ui/components/participant/contact/participant-contact';
import '/imports/ui/components/profile-link/profile-link';

import './event-participants.html';

Template.eventParticipants.onCreated(function () {
	this.increaseBy = 10;
	this.participantsDisplayLimit = new ReactiveVar(this.increaseBy);
});

Template.eventParticipants.helpers({
	howManyEnrolled() {
		return (this.participants && this.participants.length) || 0;
	},

	sortedParticipants() {
		const { participants } = this;
		const userId = Meteor.userId();
		if (userId && participants.includes(userId)) {
			const userArrayPosition = participants.indexOf(userId);
			// remove current user form array and readd him at index 0
			participants.splice(userArrayPosition, 1); // remove
			participants.splice(0, 0, userId); // readd
		}
		return participants.slice(0, Template.instance().participantsDisplayLimit.get());
	},

	limited() {
		const participantsDisplayLimit = Template.instance().participantsDisplayLimit.get();
		return participantsDisplayLimit && this.participants.length > participantsDisplayLimit;
	},

});

Template.eventParticipants.events({
	'click .js-show-more-participants'(event, instance) {
		const { participantsDisplayLimit } = instance;
		participantsDisplayLimit.set(participantsDisplayLimit.get() + instance.increaseBy);
	},
});

Template.eventParticipant.helpers({
	ownUserParticipantClass() {
		if (this.participant === Meteor.userId()) {
			return 'is-own-user';
		}
		return '';
	},
});
