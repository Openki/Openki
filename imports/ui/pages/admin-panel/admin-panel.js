import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';

import Regions from '/imports/api/regions/regions.js';

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
		, templateName: 'featureGroup'
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

Template.featureGroup.onCreated(function featureGroupOnCreated() {
	this.subscribe('groupsFind', {});
	this.busy(false);
});

Template.featureGroup.helpers({
	groups: () => Groups.find({}, { sort: { name: 1 } }),
	regionName: () => Regions.findOne(Session.get('region')).name,
	featuredGroup() {
		const groupId = Regions.findOne(Session.get('region')).featuredGroup;
		return Groups.findOne(groupId);
	}
});

Template.featureGroup.events({
	'submit #featureGroup'(event, instance) {
		event.preventDefault();

		const regionId = Session.get('region');
		const groupId = instance.$('#groupToBeFeatured').val();

		instance.busy('saving');
		Meteor.call('region.featureGroup', regionId, groupId, (err) => {
			if (err) {
				console.error(err);
			} else {
				instance.busy(false);
			}
		});
	},

	'click .js-unset-featured-group'(event, instance) {
		instance.busy('deleting');
		Meteor.call('region.unsetFeaturedGroup', Session.get('region'), (err) => {
			if (err) {
				console.error(err);
			} else {
				instance.busy(false);
			}
		});
	}
});
