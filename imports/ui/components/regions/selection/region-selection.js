import { Session } from 'meteor/session';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Router } from 'meteor/iron:router';
import { Template } from 'meteor/templating';

import Regions from '/imports/api/regions/regions';
import RegionSelection from '/imports/utils/region-selection';
import FilterPreview from '/imports/ui/lib/filter-preview';
import StringTools from '/imports/utils/string-tools';

import './region-selection.html';

Template.regionSelectionWrap.onCreated(function () {
	this.subscribe('Regions');
	this.state = new ReactiveDict();
	this.state.setDefault('searchingRegions', false);
});

Template.regionDisplay.helpers({
	currentRegion() {
		return Regions.findOne(Session.get('region'));
	},
});

Template.regionDisplay.events({
	'click .js-region-display': function (event, instance) {
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

	this.regions = (active = true) => {
		const query = { futureEventCount: active ? { $gt: 0 } : { $eq: 0 } };
		const search = this.state.get('search');
		if (search !== '') query.name = new RegExp(search, 'i');

		return Regions.find(query, { sort: { futureEventCount: -1, name: 1 } });
	};

	this.changeRegion = (regionId) => {
		const changed = !Session.equals('region', regionId);

		try {
			localStorage.setItem('region', regionId); // to survive page reload
		} catch (e) {
			console.error(e);
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
			if (RegionSelection.regionDependentRoutes.indexOf(routeName) < 0) Router.go('/');
		}
		this.close();
	};

	// create a function to toggle displaying the regionSelection
	// only if it is placed inside a wrap
	this.close = () => {
		const parentState = this.parentInstance().state;
		if (parentState.get('searchingRegions')) {
			parentState.set('searchingRegions', false);
		}
	};
});

Template.regionSelection.onRendered(function () {
	Meteor.defer(function () {
		if (!this.data || !this.data.isSplash) this.$('.js-region-search').select();
	});

	this.parentInstance().$('.dropdown').on('hide.bs.dropdown', () => {
		this.close();
	});
});

Template.regionSelection.helpers({
	regions() {
		return Template.instance().regions();
	},

	allCourses() {
		return Regions.find().fetch().reduce((acc, region) => acc + region.courseCount, 0);
	},

	allUpcomingEvents() {
		return Regions.find().fetch().reduce((acc, region) => acc + region.futureEventCount, 0);
	},

	inactiveRegions() {
		return Template.instance().regions(false);
	},
});

Template.regionSelection.events({
	'click .js-region-link': function (event, instance) {
		event.preventDefault();
		const regionId = this._id ? this._id : 'all';
		instance.changeRegion(regionId.toString());
	},

	'mouseover/mouseout/focusin/focusout .js-region-link': function (event) {
		const id = this._id;
		if (id && Session.equals('region', 'all')) {
			FilterPreview({
				property: 'region',
				id,
				activate: event.type === 'mouseover' || event.type === 'focusin',
			});
		}
	},

	'keyup .js-region-search': function (event, instance) {
		const search = String(instance.$('.js-region-search').val()).trim();
		instance.state.set({ search });
	},

	'submit .js-region-search-form': function (event, instance) {
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

	'focus .js-region-search': function (event, instance) {
		if (instance.focusFromShowAllRegions) {
			instance.focusFromShowAllRegions = false;
			return;
		}
		instance.$('.dropdown-toggle').dropdown('toggle');
	},

	'click .js-show-all-regions': function (event, instance) {
		instance.state.set('showAllRegions', true);
		instance.focusFromShowAllRegions = true;
		instance.$('.js-region-search').select();
		return false; // prevent dropdown default behavior for this specific <li>
	},

	'click .control-arrow.fa-angle-down': function (event, instance) {
		instance.$('.dropdown-toggle').dropdown('toggle');
		event.stopPropagation();
	},

	'show.bs.dropdown': function (event, instance) {
		instance.$('.dropdown > .control-arrow').removeClass('fa-angle-down').addClass('fa-angle-up');
	},

	'hide.bs.dropdown': function (event, instance) {
		instance.$('.dropdown > .control-arrow').removeClass('fa-angle-up').addClass('fa-angle-down');
	},

});

Template.regionSelectionItem.helpers({
	regionNameMarked() {
		const search = Template.instance().parentInstance().state.get('search');
		return StringTools.markedName(search, this.name);
	},

	isCurrentRegion() {
		return Session.equals('region', this._id || 'all');
	},
});
