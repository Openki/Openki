Template.regionSelectionWrap.created = function() {
	 this.subscribe("Regions");
	 var instance = this;
	 instance.searchingRegions = new ReactiveVar(false);
};

Template.regionSelectionWrap.helpers({
	searchingRegions: function() {
		return Template.instance().searchingRegions.get();
	}
});

Template.regionDisplay.helpers({
	region: function() {
		var region = Regions.findOne(Session.get('region'));
		return region;
	}
});

Template.regionDisplay.events({
	'click .js-region-display': function(event, instance) {
		instance.parentInstance().searchingRegions.set(true);
	}
});

Template.regionSelection.onCreated(function() {
	this.regionSearch = new ReactiveVar('');
});

Template.regionSelection.rendered = function() {
	Template.instance().$('.js-region-search').select();
};

Template.regionSelection.helpers({
	regions: function() {
		var search = Template.instance().regionSearch.get();
		var query = {};
		if (search !== '') query = { name: new RegExp(search, 'i') };
		var options = {sort: {futureEventCount: -1}};

		return Regions.find(query, options);
	},

	regionNameMarked: function() {
		var search = Template.instance().regionSearch.get();
		var name = this.name;
		return markedName(search, name);
	},

	region: function() {
		var region = Regions.findOne(Session.get('region'));
		return region;
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
		return region == Session.get('region');
	}
});

var handleKeyup = _.debounce(function(event, instance, parentInstance) {
	var search = instance.$('.js-region-search').val();
	search = String(search).trim();

	if (event.which === 13) {
		if (instance.regionSearch.get() === '') {
			parentInstance.searchingRegions.set(false);
		} else {
			var regionLinks = instance.$('.js-region-link');
			var first = (regionLinks.length == 1) ? 0 : 1;
			regionLinks.eq(first).click();
		}
	} else {
		instance.regionSearch.set(search);
	}
}, 100);

Template.regionSelection.events({
	'click .js-region-link': function(event, instance) {
		event.preventDefault();
		var region_id = this._id ? this._id : 'all';
		var changed = !Session.equals('region', region_id);

		localStorage.setItem("region", region_id); // to survive page reload
		Session.set('region', region_id);
		if (region_id !== 'all' && Meteor.userId()) {
			Meteor.call('user.regionChange', region_id);
		}

		// When the region changes, we want the content of the page to update
		// Many pages do not change when the region changed, so we go to
		// the homepage for those
		if (changed) {
			var routeName = Router.current().route.getName();
			var routesToKeep = ['home', 'find', 'venue', 'calendar'];
			if (routesToKeep.indexOf(routeName) < 0) Router.go('/');
		}
		instance.parentInstance().searchingRegions.set(false);
	},

	'mouseover .js-region-link': function() {
		if (this._id && Session.equals('region', 'all')) {
			courseFilterPreview('.' + this._id, true, false);
		}
	},

	'mouseout .js-region-link': function() {
		if (this._id && Session.equals('region', 'all')) {
			courseFilterPreview('.' + this._id, false, false);
		}
	},

	'focus .js-region-link': function() {
		if (this._id && Session.equals('region', 'all')) {
			courseFilterPreview('.' + this._id, true, false);
		}
	},

	'focusout .js-region-link': function() {
		if (this._id && Session.equals('region', 'all')) {
			courseFilterPreview('.' + this._id, false, false);
		}
	},

	'keyup .js-region-search': function(event, instance) {
		var parentInstance = instance.parentInstance();
		handleKeyup(event, instance, parentInstance);
	},

	'focus .js-region-search': function(event, instance) {
		var viewportWidth = Session.get('viewportWidth');
		var isRetina = Session.get('isRetina');
		var screenMD = viewportWidth >= SCSSVars.screenSM && viewportWidth <= SCSSVars.screenMD;

		if (screenMD && !isRetina) {
			$('.navbar-collapse > .nav:first-child > li:not(.navbar-link-active)').fadeTo("slow", 0);
			$('.navbar-collapse > .nav:first-child > li:not(.navbar-link-active)').hide();
		}

		var gridFloatBreakpoint = viewportWidth <= SCSSVars.gridFloat;
		if (!gridFloatBreakpoint) {
			instance.$('.dropdown').on('show.bs.dropdown', function(e){
				$(this).find('.dropdown-menu').first().stop(true, true).slideDown();
			});
		}

		instance.$('.dropdown-toggle').dropdown('toggle');
	},
});

Template.regionSelection.onRendered(function() {
	var parentInstance = this.parentInstance();
	parentInstance.$('.dropdown').on('hide.bs.dropdown', function(e) {
		var viewportWidth = Session.get('viewportWidth');
		var isRetina = Session.get('isRetina');
		var screenMD = viewportWidth >= SCSSVars.screenSM && viewportWidth <= SCSSVars.screenMD;

		if (screenMD && !isRetina) {
			$('.navbar-collapse > .nav:first-child > li:not(.navbar-link-active)').show();
			$('.navbar-collapse > .nav:first-child > li:not(.navbar-link-active)').fadeTo("slow", 1);
		}
		parentInstance.searchingRegions.set(false);
	});
});
