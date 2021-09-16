import { Session } from 'meteor/session';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';

import * as Alert from '/imports/api/alerts/alert';
import { Groups } from '/imports/api/groups/groups';
import { Regions } from '/imports/api/regions/regions';
import * as RegionsMethods from '/imports/api/regions/methods';

import './template.html';
import './styles.scss';

const Template = TemplateAny as TemplateStaticTyped<
	Record<string, unknown>,
	'adminFeatureGroupPage',
	Record<string, never>
>;

const template = Template.adminFeatureGroupPage;

template.onCreated(function () {
	this.subscribe('Groups.findFilter', {});
	this.busy(false);
});

template.helpers({
	groups: () => Groups.find({}, { sort: { name: 1 } }),
	featuredGroup() {
		const groupId = Regions.currentRegion()?.featuredGroup;
		if (!groupId) {
			return undefined;
		}
		return Groups.findOne(groupId);
	},
});

template.events({
	async 'submit .js-feature-group'(event, instance) {
		event.preventDefault();

		const regionId = Session.get('region');
		if (!regionId) {
			return;
		}

		const groupId = instance.$('#groupToBeFeatured').val() as string;

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
		event.preventDefault();

		const regionId = Session.get('region');
		if (!regionId) {
			return;
		}

		instance.busy('deleting');

		try {
			await RegionsMethods.unsetFeaturedGroup(regionId);
		} catch (err) {
			Alert.serverError(err, '');
		} finally {
			instance.busy(false);
		}
	},
});
