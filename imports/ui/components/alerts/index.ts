import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';

import { Alerts, AlertEnity } from '/imports/api/alerts/alerts';

import './template.html';
import './styles.scss';

{
	const Template = TemplateAny as TemplateStaticTyped<
		'alerts',
		unknown,
		{ updateSpacerHeight: () => void }
	>;

	const template = Template.alerts;

	template.onCreated(function () {
		const instance = this;

		instance.updateSpacerHeight = () => {
			instance.$('.alert-messages-spacer').height(instance.$('.alert-messages').height() || 0);
		};
	});

	template.helpers({
		alerts() {
			return Alerts.find();
		},
	});
}

{
	const Template = TemplateAny as TemplateStaticTyped<
		'alert',
		AlertEnity,
		{ remove: (alertId: string) => void; timedRemove: NodeJS.Timeout }
	>;

	const template = Template.alert;

	template.onCreated(function () {
		const instance = this;
		instance.remove = (alertId) => {
			const $alert = instance.$('.alert-message');
			// get 'transition-duration' and convert to miliseconds for fadeOut
			const duration = parseFloat($alert.css('transition-duration')) * 1000;
			$alert.fadeOut(duration, () => {
				(instance.parentInstance() as any).updateSpacerHeight();
				Alerts.remove({ _id: alertId });
			});
		};
	});

	template.onRendered(function () {
		const instance = this;

		(instance.parentInstance() as any).updateSpacerHeight();
		const alert = Template.currentData();
		instance.$('.alert-message').toggleClass('is-faded-in');

		instance.timedRemove = setTimeout(() => instance.remove(alert._id), alert.timeout);
	});

	template.events({
		'click .js-remove-alert'(_event, instance) {
			const alert = Template.currentData();

			if (instance.timedRemove) {
				clearTimeout(instance.timedRemove);
			}
			instance.remove(alert._id);
		},
	});

	template.helpers({
		contextualClass() {
			const alert = Template.currentData();
			return alert.type === 'error' ? 'danger' : alert.type;
		},
	});
}
