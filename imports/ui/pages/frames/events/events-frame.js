import { Template } from 'meteor/templating';

import '/imports/ui/components/events/list/event-list';

import './events-frame.html';

// eslint-disable-next-line func-names
Template.frameEvents.onRendered(function () {
	const instance = this;
	this.autorun(() => {
		instance.$('a').attr('target', '_blank');
	});
});
