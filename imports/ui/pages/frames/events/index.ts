import { Template } from 'meteor/templating';

import '/imports/ui/components/events/list';

import './events-frame.html';

Template.frameEvents.onRendered(function () {
	const instance = this;
	this.autorun(() => {
		instance.$('a').attr('target', '_blank');
	});
});
