import { Template } from 'meteor/templating';

import Alerts from '/imports/api/alerts/alerts';

import './alerts.html';

Template.alerts.onCreated(function () {
	this.updateSpacerHeight = () => {
		this.$('.alert-messages-spacer').height(this.$('.alert-messages').height());
	};
});

Template.alerts.helpers({
	alerts() {
		return Alerts.find();
	},
});

Template.alert.onCreated(function () {
	this.remove = (alertId) => {
		const $alert = this.$('.alert-message');
		// get 'transition-duration' and convert to miliseconds for fadeOut
		const duration = parseFloat($alert.css('transition-duration')) * 1000;
		$alert.fadeOut(duration, () => {
			this.parentInstance().updateSpacerHeight();
			Alerts.remove({ _id: alertId });
		});
	};
});

Template.alert.onRendered(function () {
	this.parentInstance().updateSpacerHeight();
	const alert = Template.currentData();
	this.$('.alert-message').toggleClass('is-faded-in');

	this.timedRemove = setTimeout(() => this.remove(alert._id), alert.timeout);
});

Template.alert.events({
	'click .js-remove-alert': function (event, instance) {
		if (instance.timedRemove) clearTimeout(instance.timedRemove);
		instance.remove(this._id);
	},
});

Template.alert.helpers({
	contextualClass() {
		return this.type === 'error' ? 'danger' : this.type;
	},
});
