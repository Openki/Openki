import { Mongo } from 'meteor/mongo';
import { i18n } from '/imports/startup/both/i18next';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

import * as Alert from '/imports/api/alerts/alert';
import { RegionModel } from '/imports/api/regions/regions';
import { UserModel } from '/imports/api/users/users';

import { locationFormat } from '/imports/utils/location-format';

import '/imports/ui/components/map/map';

import './template.html';
import './styles.scss';

export interface Data {
	region: RegionModel;
	onEdit: () => void;
	onDelete: () => Promise<void>;
}

export interface LocEntity {
	coordinates: [number, number];
}
export interface MarkerEntity {
	loc: LocEntity;
	main: boolean;
}

const Template = TemplateAny as TemplateStaticTyped<
	Data,
	'regionDisplay',
	{
		state: ReactiveDict<{ verifyDelete: boolean }>;
		markers: Mongo.Collection<MarkerEntity>;
		setLocation: (loc?: LocEntity) => void;
	}
>;

const template = Template.regionDisplay;

template.onCreated(function () {
	const instance = this;
	instance.busy(true);

	instance.state = new ReactiveDict(undefined, {
		verifyDelete: false,
	});

	const markers = new Mongo.Collection<MarkerEntity>(null); // Local collection for in-memory storage
	instance.markers = markers;

	this.setLocation = (loc) => {
		markers.remove({ main: true });
		if (!loc) {
			return;
		}
		markers.insert({ loc, main: true });
	};
});

template.onRendered(function () {
	const instance = this;

	instance.busy(false);

	instance.autorun(() => {
		const { region } = Template.currentData();

		instance.setLocation(region.loc);
	});
});

template.helpers({
	mayEdit() {
		const { region } = Template.currentData();

		return region.editableBy(Meteor.user() as UserModel);
	},

	verifyDelete() {
		return Template.instance().state.get('verifyDelete');
	},

	markers() {
		return Template.instance().markers;
	},

	locationDisplay(loc: LocEntity) {
		return locationFormat(loc);
	},
});

template.events({
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

			Alert.success(i18n('region.removed', 'Removed region "{NAME}".', { NAME: region.name }));
		} catch (err) {
			Alert.serverError(err, i18n('region.deleting.error', 'Deleting the region went wrong'));
		} finally {
			instance.busy(false);
		}
	},
});
