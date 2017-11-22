import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import './admin.html';

Template.admin.helpers({
	isAdmin: () => privilegedTo('admin')
});

Template.admin.events({
	'submit #setFeaturing'(event, instance) {
		event.preventDefault();

		const regionId = Session.get('region');
		const featuring = instance.$('#featuring').val();

		Meteor.call('region.setFeaturing', regionId, featuring);
	}
});
