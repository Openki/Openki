Template.regionSelectionWrap.created = function() {
	var instance = this;
	instance.subscribe("Regions");
	instance.searchingRegions = new ReactiveVar(false);
};

Template.regionSelectionWrap.helpers({
	searchingRegions: function() {
		return Template.instance().searchingRegions.get();
	}
});

Template.regionDisplay.helpers({
	region: function() {
		return Regions.findOne(Session.get('region'));
	}
});

Template.regionDisplay.events({
	'click .js-region-display': function(event, instance) {
		instance.parentInstance().searchingRegions.set(true);
	}
});

Template.regionSelection.onCreated(function() {
	var instance = this;

	instance.regionSearch = new ReactiveVar('');

	instance.regions = function() {
		var search = instance.regionSearch.get();
		var query = {};
		if (search !== '') query = { name: new RegExp(search, 'i') };
		var options = { sort: {futureEventCount: -1} };

		return Regions.find(query, options);
	};

	instance.changeRegion = function(regionId) {
		var changed = !Session.equals('region', regionId);

		localStorage.setItem("region", regionId); // to survive page reload
		Session.set('region', regionId);
		if (regionId !== 'all' && Meteor.userId()) {
			Meteor.call('user.regionChange', regionId);
		}

		// When the region changes, we want the content of the page to update
		// Many pages do not change when the region changed, so we go to
		// the homepage for those
		if (changed) {
			var routeName = Router.current().route.getName();
			if (RoutesToKeep.indexOf(routeName) < 0) Router.go('/');
		}
		instance.close();
	};

	// create a function to toggle displaying the regionSelection
	// only if it is placed inside a wrap
	instance.close = function() {
		var searchingRegions = instance.parentInstance().searchingRegions;
		if (searchingRegions) {	searchingRegions.set(false); }
	};
});

Template.regionSelection.helpers({
	regions: function() {
		return Template.instance().regions();
	},

	regionNameMarked: function() {
		var search = Template.instance().regionSearch.get();
		var name = this.name;
		return markedName(search, name);
	},

	region: function() {
		return Regions.findOne(Session.get('region'));
	},

	allCourses: function() {
		return _.reduce(Regions.find().fetch(), function(acc, region) {
			return acc + region.courseCount;
		}, 0);
	},

	allUpcomingEvents: function() {
		return _.reduce(Regions.find().fetch(), function(acc, region) {
			return acc + region.futureEventCount;
		}, 0);
	},

	currentRegion: function() {
		var region = this._id || "all";
		return Session.equals('region', region);
	}
});

Template.regionSelection.events({
	'click .js-region-link': function(event, instance) {
		event.preventDefault();
		var regionId = this._id ? this._id : 'all';
		instance.changeRegion(regionId);
	},

	'mouseover, mouseout, focusin, focusout .js-region-link': function(e) {
		var regionID = this._id;
		if (regionID && Session.equals('region', 'all')) {
			var activate = e.type == 'mouseover' || e.type == 'focusin';
			var previewOptions = {
				selector: ('.region-' + regionID),
				activate: activate
			};
			courseFilterPreview(previewOptions);
		}
	},

	'keyup .js-region-search': function(e, instance) {
		var search = instance.$('.js-region-search').val();
		search = String(search).trim();

		instance.regionSearch.set(search);
	},

	'submit .js-region-search-form': function(event, instance) {
		event.preventDefault();
		instance.$('.dropdown-toggle').dropdown('toggle');
		if (instance.regionSearch.get() === '') {
			instance.close();
		} else {
			var selectedRegion = instance.regions().fetch()[0];
			if (selectedRegion) {
				instance.changeRegion(selectedRegion._id);
			} else {
				instance.changeRegion('all');
			}
		}
	},

	'focus .js-region-search': function(event, instance) {
		var viewportWidth = Session.get('viewportWidth');
		var isRetina = Session.get('isRetina');
		var screenMD = viewportWidth >= SCSSVars.screenSM && viewportWidth <= SCSSVars.screenMD;

		if (screenMD && !isRetina) {
			$('.navbar-collapse > .nav:first-child > li:not(.navbar-link-active)').fadeTo("slow", 0);
			$('.navbar-collapse > .nav:first-child > li:not(.navbar-link-active)').hide();
		}

		instance.$('.dropdown-toggle').dropdown('toggle');
	},
});

Template.regionSelection.onRendered(function() {
	var instance = this;

	instance.$('.js-region-search').select();

	instance.parentInstance().$('.dropdown').on('hide.bs.dropdown', function(e) {
		var viewportWidth = Session.get('viewportWidth');
		var isRetina = Session.get('isRetina');
		var screenMD = viewportWidth >= SCSSVars.screenSM && viewportWidth <= SCSSVars.screenMD;

		if (screenMD && !isRetina) {
			$('.navbar-collapse > .nav:first-child > li:not(.navbar-link-active)').show();
			$('.navbar-collapse > .nav:first-child > li:not(.navbar-link-active)').fadeTo("slow", 1);
		}

		instance.close();
	});
});
