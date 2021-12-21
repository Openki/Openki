import { ReactiveDict } from 'meteor/reactive-dict';
import { Meteor } from 'meteor/meteor';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';

import { Users } from '/imports/api/users/users';

import '/imports/ui/components/send-message';

import './template.html';
import './styles.scss';

const Template = TemplateAny as TemplateStaticTyped<
	'participantContact',
	{ participant: string },
	{
		state: ReactiveDict<{
			showModal: boolean;
		}>;
	}
>;

const template = Template.participantContact;

template.onCreated(function () {
	const instance = this;

 Meteor.subscribe('user', instance.data.participant);

	instance.state = new ReactiveDict();

	instance.state.setDefault({
		showModal: false,
	});
});

template.onRendered(function () {
	const instance = this;

	instance.autorun(() => {
		if (instance.state.get('showModal')) {
			Meteor.defer(() => {
				instance.$('.js-participant-contact-modal').modal('show');
			});
		}
	});
});

template.helpers({
	hideModal() {
		const instance = Template.instance();
		return () => {
			instance.$('.js-participant-contact-modal').modal('hide');
		};
	},

	showParticipantContact() {
		const data = Template.currentData();

		const userId = Meteor.userId();
		if (!userId) {
			return false;
		}

		return userId !== data.participant;
	},

	userAcceptsPrivateMessages() {
		const data = Template.currentData();

		const user = Users.findOne(data.participant);
		return user?.acceptsPrivateMessages;
	},
});

template.events({
	'click .js-show-participant-contact-modal'(_event, instance) {
		instance.state.set('showModal', true);
	},

	'hidden.bs.modal .js-participant-contact-modal'(_event, instance) {
		instance.state.set('showModal', false);
	},
});
