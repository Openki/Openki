import { Template } from 'meteor/templating';

import ClientMessages from '/imports/api/messages/messages.js';
import { RemoveMessage } from '/imports/api/messages/methods.js';

import './messages.html';

Template.messages.onCreated(function() {
	this.updateSpacerHeight = () => {
		this.$('.messages-spacer').height(this.$('.messages').height());
	};
});

Template.messages.helpers({
	messages() {
		return ClientMessages.find();
	}
});

Template.message.onCreated(function() {
	this.remove = (messageId) => {
		const $message = this.$('.message');
		// get 'transition-duration' and convert to miliseconds for fadeOut
		const duration = parseFloat($message.css('transition-duration')) * 1000;
		$message.fadeOut(duration, () => {
			this.parentInstance().updateSpacerHeight();
			RemoveMessage(messageId);
		});
	};
});

Template.message.onRendered(function() {
	this.parentInstance().updateSpacerHeight();
	this.$('.message').toggleClass('is-faded-in');

	const message = Template.currentData();
	const timeout = message.type === 'error' ? 60000 : 4000;
	this.timedRemove = setTimeout(() => this.remove(message._id), timeout);
});

Template.message.events({
	'click .js-remove-message'(event, instance) {
		if (instance.timedRemove) clearTimeout(instance.timedRemove);
		instance.remove(this._id);
	}
});

Template.message.helpers({
	highlightedMessage() {
		return Spacebars.SafeString(
			this.message
			.replace(/"\b/g, '<strong>"')
			.replace(/"\B/g, '"</strong>')
		);
	}
});
