import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';

import * as StatsMethods from '/imports/api/stats/methods';
import { Regions } from '/imports/api/regions/regions';
import { Stats } from '/imports/api/stats/stats';

import * as UserPrivilegeUtils from '/imports/utils/user-privilege-utils';

import './template.html';
import './styles.scss';

const Template = TemplateAny as TemplateStaticTyped<
	'statsPage',
	Record<string, unknown>,
	{
		regionName: ReactiveVar<string | false>;
		region: ReactiveVar<string>;
		stats: ReactiveVar<Stats | false>;
	}
>;

const template = Template.statsPage;

template.onCreated(function () {
	function getRegionFromQuery() {
		const region: string = Router.current().params.query.region || Session.get('region');

		return region || 'all';
	}

	this.subscribe('Regions');
	this.regionName = new ReactiveVar(false);
	this.region = new ReactiveVar(getRegionFromQuery());
	this.stats = new ReactiveVar(false);

	this.autorun(async () => {
		this.stats.set(false);
		const stats = await StatsMethods.region(this.region.get());
		this.stats.set(stats);
	});
});

template.helpers({
	isAdmin() {
		return UserPrivilegeUtils.privilegedTo('admin');
	},
	regionName() {
		const currentRegion = Regions.findOne({ _id: Template.instance().region.get() });
		return currentRegion?.name || '';
	},
	regionStats() {
		return Template.instance().stats.get();
	},
	selectedRegion(region = 'all') {
		return region === Template.instance().region.get() ? 'selected' : '';
	},
});

template.events({
	'change .js-stats-region-selector'(event, instance) {
		instance.region.set((event.target as HTMLSelectElement).value);
	},
});
