import { Template } from 'meteor/templating';

import './admin-panel.html';

// Test
Template.adminPanel.helpers({
	tasks: () => (
		[
			{
				name: mf('adminPanel.tasks.log', 'Show log'),
				icon: 'fa-list-alt',
				route: 'log',
			},
			{
				name: mf('adminPanel.tasks.featuredGroup', 'Feature group'),
				icon: 'fa-users',
				route: 'featureGroup',
			},
		]
	),
});
