import { Mongo } from 'meteor/mongo';
import { mf } from 'meteor/msgfmt:core';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

import * as Alert from '/imports/api/alerts/alert';

import { locationFormat } from '/imports/utils/location-format';

import '/imports/ui/components/map/map';

import './template.html';
import './styles.scss';

Template.regionDisplay.onCreated(function () {
	const instance = this;
	instance.busy(true);

	instance.state = new ReactiveDict();
	instance.state.setDefault({
		verifyDelete: false,
	});

	const markers = new Mongo.Collection(null); // Local collection for in-memory storage
	instance.markers = markers;

	/**
	 * @param {{ coordinates: [number, number]; }} loc
	 */
	this.setLocation = (loc) => {
		markers.remove({ main: true });
		if (!loc) {
			return;
		}
		markers.insert({
			loc,
			main: true,
		});
	};
});

Template.regionDisplay.onRendered(function () {
	const instance = this;

	instance.busy(false);

	instance.autorun(() => {
		const { region } = Template.currentData();

		instance.setLocation(region.loc);
	});
});

Template.regionDisplay.helpers({
	mayEdit() {
		const { region } = Template.currentData();

		return region.editableBy(Meteor.user());
	},

	verifyDelete() {
		return Template.instance().state.get('verifyDelete');
	},

	markers() {
		return Template.instance().markers;
	},
	/**
	 * @param {{ coordinates: [number, number]; }} loc
	 */
	locationDisplay(loc) {
		return locationFormat(loc);
	},
});

Template.regionDisplay.events({
	'click .js-region-edit'(_event, instance) {
		instance.state.set('verifyDelete', false);
		instance.data.onEdit();
	},

	'click .js-region-delete'(_event, instance) {
		instance.state.set('verifyDelete', true);
	},

	'click .js-region-delete-cancel'(_event, instance) {
		instance.state.set('verifyDelete', false);
	},

	async 'click .js-region-delete-confirm'(_event, instance) {
		const { region } = instance.data;
		instance.busy('deleting');
		try {
			await instance.data.onDelete();

			Alert.success(mf('region.removed', { NAME: region.name }, 'Removed region "{NAME}".'));
		} catch (err) {
			Alert.serverError(err, mf('region.deleting.error', 'Deleting the region went wrong'));
		} finally {
			instance.busy(false);
		}
	},
});
