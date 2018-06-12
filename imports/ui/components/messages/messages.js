import { Template } from 'meteor/templating';

import AlertMessages from '/imports/api/alert-messages/alert-messages.js';

import './messages.html';

Template.messages.onCreated(function() {
	this.updateSpacerHeight = () => {
		this.$('.messages-spacer').height(this.$('.messages').height());
	};
});

Template.messages.helpers({
	messages() {
		return AlertMessages.find();
	}
});

Template.message.onCreated(function() {
	this.remove = (messageId) => {
		const $message = this.$('.message');
		// get 'transition-duration' and convert to miliseconds for fadeOut
		const duration = parseFloat($message.css('transition-duration')) * 1000;
		$message.fadeOut(duration, () => {
			this.parentInstance().updateSpacerHeight();
			AlertMessages.remove({ _id: messageId });
		});
	};
});

Template.message.onRendered(function() {
	this.parentInstance().updateSpacerHeight();
	const message = Template.currentData();
	this.$('.message').toggleClass('is-faded-in');

	this.timedRemove = setTimeout(() => this.remove(message._id), message.timeout);
});

Template.message.events({
	'click .js-remove-message'(event, instance) {
		if (instance.timedRemove) clearTimeout(instance.timedRemove);
		instance.remove(this._id);
	}
});

Template.message.helpers({
	contextualClass() {
		return this.type === 'error' ? 'danger' : this.type;
	},

	highlightedMessage() {
		return Spacebars.SafeString(
			this.message
			.replace(/"\b/g, '<strong>"')
			.replace(/"\B/g, '"</strong>')
		);
	}
});
