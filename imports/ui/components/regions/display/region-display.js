import { Mongo } from 'meteor/mongo';
import { Template } from 'meteor/templating';

import { locationFormat } from '/imports/utils/location-format';

import '/imports/ui/components/map/map';

import './region-display.html';

Template.regionDisplay.onCreated(function () {
	const instance = this;
	instance.busy();

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
		instance.data.onEdit();
	},
});
