import { Session } from 'meteor/session';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Router } from 'meteor/iron:router';
import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';

import * as Alert from '/imports/api/alerts/alert';
import { Regions } from '/imports/api/regions/regions';

import { FilterPreview } from '/imports/ui/lib/filter-preview';

import RegionSelection from '/imports/utils/region-selection';
import * as StringTools from '/imports/utils/string-tools';

import './region-selection.html';

Template.regionSelectionWrap.onCreated(function () {
	this.subscribe('Regions');
	this.state = new ReactiveDict();
	this.state.setDefault('searchingRegions', false);
});

Template.regionDisplay.events({
	'click .js-region-display'(event, instance) {
		instance.parentInstance().state.set('searchingRegions', true);
	},
});

Template.regionSelection.onCreated(function () {
	this.state = new ReactiveDict();
	this.state.setDefault(
		{
			showAllRegions: false,
			search: '',
		},
	);

	this.autorun(() => {
		const search = this.state.get('search');
		this.state.set('showAllRegions', search !== '');
	});

	this.minNumberOfRegionInSelection = Meteor.settings.public.regionSelection?.minNumber || 5;

	/**
	 * Query some regions
	 * @param {{active?: boolean; limit?: number}} options
	 */
	this.regions = (options = {}) => {
		const query = {};

		if (typeof options.active === 'boolean') {
			query.futureEventCount = options.active ? { $gt: 0 } : { $eq: 0 };
		}

		const search = this.state.get('search');
		if (search !== '') {
			query.name = new RegExp(search, 'i');
		}

		return Regions.find(query, {
			sort: { futureEventCount: -1, courseCount: -1, name: 1 },
			limit: options.limit,
		});
	};

	this.changeRegion = (regionId) => {
		const changed = !Session.equals('region', regionId);

		try {
			localStorage.setItem('region', regionId); // to survive page reload
		} catch (e) {
			Alert.error(e);
		}
		Session.set('region', regionId);
		if (regionId !== 'all' && Meteor.userId()) {
			Meteor.call('user.regionChange', regionId);
		}

		// When the region changes, we want the content of the page to update
		// Many pages do not change when the region changed, so we go to
		// the homepage for those
		if (changed) {
			const routeName = Router.current().route.getName();
			if (!RegionSelection.regionDependentRoutes.includes(routeName)) {
				Router.go('/');
			}
		}
		this.close();
	};

	// create a function to toggle displaying the regionSelection
	// only if it is placed inside a wrap
	this.close = () => {
		const parentState = this.parentInstance().state;
		if (parentState?.get('searchingRegions')) {
			parentState.set('searchingRegions', false);
		}
	};
});

Template.regionSelection.onRendered(function () {
	Meteor.defer(function () {
		if (!this.data || !this.data.isSplash) {
			this.$('.js-region-search').select();
		}
	});

	this.parentInstance().$('.dropdown').on('hide.bs.dropdown', () => {
		this.close();
	});
});

Template.regionSelection.helpers({


	allCourses() {
		return Regions.find().fetch().reduce((acc, region) => acc + region.courseCount, 0);
	},

	allUpcomingEvents() {
		return Regions.find().fetch().reduce((acc, region) => acc + region.futureEventCount, 0);
	},

	mostActiveRegions() {
		const minNumber = Template.instance().minNumberOfRegionInSelection;

		const allActiveRegions = Template.instance().regions({ active: true });

		if (allActiveRegions.count() >= minNumber) return allActiveRegions;

		// Query more to have a min Number of regions
		const someInactiveRegions = Template.instance().regions({
			active: false,
			limit: minNumber - allActiveRegions.count(),
		});

		return [...allActiveRegions, ...someInactiveRegions];
	},

	hasMoreRegions() {
		const minNumber = Template.instance().minNumberOfRegionInSelection;

		const numberOfRegions = Template.instance().regions().count();

		return numberOfRegions > minNumber
		&& numberOfRegions > Template.instance().regions({ active: true }).count();
	},

	allRegions() {
		return Template.instance().regions();
	},

	aboutLink() {
		return Meteor.settings.public.regionSelection?.aboutLink;
	},

});

Template.regionSelection.events({
	'click .js-region-link'(event, instance) {
		event.preventDefault();
		const regionId = this._id || 'all';
		instance.changeRegion(regionId.toString());
	},

	'mouseover/mouseout/focusin/focusout .js-region-link'(event) {
		const id = this._id;
		if (id && Session.equals('region', 'all')) {
			FilterPreview({
				property: 'region',
				id,
				activate: event.type === 'mouseover' || event.type === 'focusin',
			});
		}
	},

	'keyup .js-region-search'(event, instance) {
		const search = String(instance.$('.js-region-search').val()).trim();
		instance.state.set({ search });
	},

	'submit .js-region-search-form'(event, instance) {
		event.preventDefault();
		instance.$('.dropdown-toggle').dropdown('toggle');
		if (instance.state.get('search') === '') {
			instance.close();
		} else {
			const selectedRegion = instance.regions().fetch()[0];
			if (selectedRegion) {
				instance.changeRegion(selectedRegion._id);
			} else {
				instance.changeRegion('all');
			}
		}
	},

	'focus .js-region-search'(event, instance) {
		if (instance.focusFromShowAllRegions) {
			/* eslint-disable-next-line no-param-reassign */
			instance.focusFromShowAllRegions = false;
			return;
		}
		instance.$('.dropdown-toggle').dropdown('toggle');
	},

	'click .js-show-all-regions'(event, instance) {
		instance.state.set('showAllRegions', true);
		/* eslint-disable-next-line no-param-reassign */
		instance.focusFromShowAllRegions = true;
		instance.$('.js-region-search').select();
		return false; // prevent dropdown default behavior for this specific <li>
	},

	'click .control-arrow.fa-angle-down'(event, instance) {
		instance.$('.dropdown-toggle').dropdown('toggle');
		event.stopPropagation();
	},

	'show.bs.dropdown'(event, instance) {
		instance.$('.dropdown > .control-arrow').removeClass('fa-angle-down').addClass('fa-angle-up');
	},

	'hide.bs.dropdown'(event, instance) {
		instance.$('.dropdown > .control-arrow').removeClass('fa-angle-up').addClass('fa-angle-down');
	},

});

Template.regionSelectionItem.helpers({
	regionNameMarked() {
		const search = Template.instance().parentInstance().state.get('search');
		return StringTools.markedName(search, this.name);
	},
});
