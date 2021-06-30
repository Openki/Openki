import { Mongo } from 'meteor/mongo';
import { Template } from 'meteor/templating';

import { locationFormat } from '/imports/utils/location-format';

import '/imports/ui/components/map/map';

import './region-display.html';
//import { isTenantEditableBy } from '/imports/utils/isTenantEditableBy';

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
		const data = Template.currentData();

		instance.setLocation(data.region.loc);
	});
});

Template.regionDisplay.helpers({
	mayEdit() {
		return true; // isTenantEditableBy(Template.instance().data.region.tenant, Meteor.user()._id);
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
