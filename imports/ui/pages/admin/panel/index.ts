import { i18n } from '/imports/startup/both/i18next';
import { Template } from 'meteor/templating';

import './admin-panel.html';

Template.adminPanel.helpers({
	tasks: () => [
		{
			name: i18n('adminPanel.tasks.log', 'Show log'),
			icon: 'fa-list-alt',
			route: 'log',
		},
		{
			name: i18n('adminPanel.tasks.featuredGroup', 'Feature group'),
			icon: 'fa-users',
			route: 'featureGroup',
		},
		{
			name: i18n('adminPanel.tasks.users', 'Users'),
			icon: 'fa-user',
			route: 'users',
		},
		{
			name: i18n('adminPanel.tasks.venues', 'Venues'),
			icon: 'fa-home',
			route: 'venuesMap',
		},
		{
			name: i18n('adminPanel.tasks.stats', 'Statistics'),
			icon: 'fa fa-line-chart',
			route: 'stats',
		},
		{
			name: i18n('adminPanel.tasks.tenants', 'Organizations'),
			icon: 'fa-sitemap',
			route: 'tenants',
		},
	],
});
