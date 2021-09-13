import i18next from 'i18next';
import { Template } from 'meteor/templating';

import './admin-panel.html';

Template.adminPanel.helpers({
	tasks: () => [
		{
			name: i18next.t('adminPanel.tasks.log', 'Show log'),
			icon: 'fa-list-alt',
			route: 'log',
		},
		{
			name: i18next.t('adminPanel.tasks.featuredGroup', 'Feature group'),
			icon: 'fa-users',
			route: 'featureGroup',
		},
		{
			name: i18next.t('adminPanel.tasks.users', 'Users'),
			icon: 'fa-user',
			route: 'users',
		},
		{
			name: i18next.t('adminPanel.tasks.venues', 'Venues'),
			icon: 'fa-home',
			route: 'venuesMap',
		},
		{
			name: i18next.t('adminPanel.tasks.stats', 'Statistics'),
			icon: 'fa fa-line-chart',
			route: 'stats',
		},
		{
			name: i18next.t('adminPanel.tasks.tenants', 'Organizations'),
			icon: 'fa-sitemap',
			route: 'tenants',
		},
	],
});
