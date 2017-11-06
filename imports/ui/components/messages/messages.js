import { Template } from 'meteor/templating';

import ClientMessages from '/imports/api/messages/messages.js';
import { RemoveMessage } from '/imports/api/messages/methods.js';

import './messages.html';

Template.messages.helpers({
	hasMessages: () => ClientMessages.find().count(),
	messages: () => ClientMessages.find()
});

Template.message.onRendered(function messageOnRendered() {
	const message = this.data;

	if (message.type == 'success') {
		setTimeout(() => RemoveMessage(message._id), 5000);
	}
});

Template.message.events({
	'click button.close'() {
		RemoveMessage(this._id);
	}
});
