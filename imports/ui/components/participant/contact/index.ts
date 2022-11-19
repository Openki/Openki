import { ReactiveDict } from 'meteor/reactive-dict';
import { Meteor } from 'meteor/meteor';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';

import { Users } from '/imports/api/users/users';
import * as emailMethods from '/imports/api/emails/methods';
import { EventModel } from '/imports/api/events/events';
import { CourseModel } from '/imports/api/courses/courses';
import { SendPrivateMessageOptions } from '/imports/api/emails/methods';

import { i18n } from '/imports/startup/both/i18next';
import { MeteorAsync } from '/imports/utils/promisify';

import '/imports/ui/components/send-message';
import type { Data as SendMessageData } from '/imports/ui/components/send-message';

import './template.html';
import './styles.scss';

const Template = TemplateAny as TemplateStaticTyped<
	'participantContact',
	{ participant: string; course?: CourseModel; event?: EventModel },
	{
		state: ReactiveDict<{
			showModal: boolean;
		}>;
	}
>;

const template = Template.participantContact;

template.onCreated(function () {
	const instance = this;

	instance.state = new ReactiveDict();

	instance.state.setDefault({
		showModal: false,
	});

	instance.autorun(async () => {
		const { participant } = Template.currentData();
		instance.subscribe('user', participant);
	});
});

template.onRendered(function () {
	const instance = this;

	instance.autorun(async () => {
		if (instance.state.get('showModal')) {
			await MeteorAsync.defer();

			instance.$('.js-participant-contact-modal').modal('show');
		}
	});
});

template.helpers({
	showParticipantContact() {
		const { data } = Template.instance();

		const userId = Meteor.userId();
		if (!userId) {
			return false;
		}

		return userId !== data.participant;
	},

	userAcceptsPrivateMessages() {
		const { data } = Template.instance();

		const user = Users.findOne(data.participant);
		return user?.acceptsPrivateMessages;
	},

	sendMessageAttr(): SendMessageData {
		const instance = Template.instance();
		const { data } = instance;
		const user = Users.findOne(data.participant);

		return {
			placeholder: i18n(
				'participantContact.sendMessage.placeholder',
				'Hi {USER}. I wanted to tell you…',
				{ USER: user?.getDisplayName() },
			),
			onSend: async (message, options) => {
				const sendPrivateMessageOptions = options as SendPrivateMessageOptions;
				if (data.course) {
					sendPrivateMessageOptions.courseId = data.course?._id;
				}
				if (data.event) {
					sendPrivateMessageOptions.eventId = data.event?._id;
				}
				await emailMethods.sendPrivateMessage(data.participant, message, sendPrivateMessageOptions);
				instance.$('.js-participant-contact-modal').modal('hide');
			},
		};
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
