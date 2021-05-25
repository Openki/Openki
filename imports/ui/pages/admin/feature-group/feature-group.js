import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';

import * as Alert from '/imports/api/alerts/alert';
import { Groups } from '/imports/api/groups/groups';
import { Regions } from '/imports/api/regions/regions';
import * as RegionsMethods from '/imports/api/regions/methods';

import './feature-group.html';

Template.featureGroup.onCreated(function featureGroupOnCreated() {
	this.subscribe('Groups.findFilter', {});
	this.busy(false);
});

Template.featureGroup.helpers({
	groups: () => Groups.find({}, { sort: { name: 1 } }),
	featuredGroup() {
		const groupId = Regions.currentRegion().featuredGroup;
		return Groups.findOne(groupId);
	},
});

Template.featureGroup.events({
	async 'submit .js-feature-group'(event, instance) {
		event.preventDefault();

		const regionId = Session.get('region');
		const groupId = instance.$('#groupToBeFeatured').val();

		instance.busy('saving');

		try {
			await RegionsMethods.featureGroup(regionId, groupId);
		} catch (err) {
			Alert.serverError(err, '');
		} finally {
			instance.busy(false);
		}
	},

	async 'click .js-unset-featured-group'(event, instance) {
		instance.busy('deleting');
		try {
			await RegionsMethods.unsetFeaturedGroup(Session.get('region'));
		} catch (err) {
			Alert.serverError(err, '');
		} finally {
			instance.busy(false);
		}
	},
});
