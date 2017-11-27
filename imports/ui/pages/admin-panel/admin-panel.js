import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';

import './admin-panel.html';

Template.adminPanel.onCreated(function adminOnCreated() {
	this.activeTask = new ReactiveVar(false);

	this.tasks = [
		{ name: mf('adminDashboard.tasks.log', 'Show log')
		, icon: 'fa-list-alt'
		, routeName: 'log'
		}
	,
		{ name: mf('adminDashboard.tasks.featuredGroup', 'Feature group')
		, icon: 'fa-users'
		, templateName: 'setFeaturedGroup'
		}
	];
});

Template.adminPanel.helpers({
	isAdmin: () => privilegedTo('admin'),
	activeTask: () => Template.instance().activeTask.get()
});

Template.adminPanel.events({
	'click #backToDashboard'(event, instance) {
		instance.activeTask.set(false);
	}
});

Template.adminDashboard.helpers({
	tasks: () => Template.instance().parentInstance().tasks
});

Template.adminDashboard.events({
	'click .js-admin-task'(event, instance) {
		if (this.templateName) {
			instance.parentInstance().activeTask.set(this.templateName);
		} else {
			Router.go(this.routeName);
		}
	}
});

Template.setFeaturedGroup.onCreated(function setFeaturedGroupOnCreated() {
	this.autorun(() => { this.subscribe('groupsFind', {}); });
});

Template.setFeaturedGroup.helpers({
	groups: () => Groups.find(),
	regionName: () => Regions.findOne(Session.get('region')).name
});

Template.setFeaturedGroup.events({
	'submit #setFeaturedGroup'(event, instance) {
		event.preventDefault();

		const regionId = Session.get('region');
		const groupId = instance.$('#groupToBeFeatured').val();

		Meteor.call('region.setFeaturedGroup', regionId, groupId);
	}
});
