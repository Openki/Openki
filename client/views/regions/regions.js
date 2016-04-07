Template.region_sel_outer.created = function(){
	 this.subscribe("Regions");
	 var instance = this;
	 instance.searchingRegions = new ReactiveVar(false);
};

Template.region_sel_outer.helpers({
	searchingRegions: function() {
		return Template.instance().searchingRegions.get();
	}
});

Template.regionsDisplay.helpers({
	region: function(){
		var region = Regions.findOne(Session.get('region'));
		return region;
	}
});

Template.regionsDisplay.events({
	'click .-regionsDisplay': function(event, instance) {
		instance.parentInstance().searchingRegions.set(true);
	}
});

Template.region_sel.created = function(){
	var instance = this;
	var regions = Regions.find().fetch();
	var results = {};
	for (i = 0; i < regions.length; i++) {
		var country = regions[i].country || "undefined";
		if (!results[country]) results[country] = [];
		results[country].push(regions[i]);
	}
	instance.regionSearchResults = new ReactiveVar(results);
};

Template.region_sel.rendered = function(){
	Template.instance().$('.-searchRegions').select();
};

var updateRegionSearch = function(event, instance) {
	var query = instance.$('.-searchRegions').val();
	var regions = Regions.find().fetch();

	var lowQuery = query.toLowerCase();
	var results = {};
	for (i = 0; i < regions.length; i++) {
		if (regions[i].name.toLowerCase().indexOf(lowQuery) >= 0) {
			var country = regions[i].country || "undefined";
			if (!results[country]) results[country] = [];
			results[country].push(regions[i]);
		}
	}
	instance.regionSearchResults.set(results);
	var regExpQuery = new RegExp(lowQuery, 'i');
	instance.$('.regionName').html(function() {
	  return $(this).text().replace(regExpQuery, '<strong>$&</strong>');
	});
};

Template.region_sel.helpers({
	countries: function() {
		return Object.keys(Template.instance().regionSearchResults.get());
	},

	lowCountry: function() {
		return this.toLowerCase();
	},

	countryName: function() {
		return mf('country.'+this);
	},

	regions: function(){
		return Template.instance().regionSearchResults.get()[this];
	},

	region: function(){
		var region = Regions.findOne(Session.get('region'));
		return region;
	},

	totalNumberOfEvents: function() {
		return Events.find().count();
	},

	numberOfEvents: function() {
		return Events.find({region: this._id}).count();
	},

	currentRegion: function() {
		var region = this._id || "all";
		return region == Session.get('region');
	}
});

Template.region_sel.events({
	'click a.regionselect': function(event, instance){
		var region_id = this._id ? this._id : 'all';
		var changed = Session.get('region') !== region_id;

		localStorage.setItem("region", region_id); // to survive page reload
		Session.set('region', region_id);

		// When the region changes, we want the content of the page to update
		// Many pages do not change when the region changed, so we go to
		// the homepage for those
		if (changed) {
			var routeName = Router.current().route.getName();
			var routesToKeep = ['home', 'find', 'locations', 'calendar'];
			if (routesToKeep.indexOf(routeName) < 0) Router.go('/');
		}
		instance.parentInstance().searchingRegions.set(false);
		e.preventDefault();
	},

	'mouseover li.region a.regionselect': function() {
		if (Session.get('region') == "all")
			$('.courselist_course').not('.'+this._id).stop().fadeTo('slow', 0.33);
	},

	'mouseout li.region a.regionselect': function() {
		if (Session.get('region') == "all")
			$('.courselist_course').not('.'+this._id).stop().fadeTo('slow', 1);
	},

	'keyup .-searchRegions': _.debounce(updateRegionSearch, 100),

	'focus .-searchRegions': function(event, instance) {
		instance.$('.dropdown-toggle').dropdown('toggle');
		var regions = Regions.find().fetch();
		var results = {};
		for (i = 0; i < regions.length; i++) {
			var country = regions[i].country || "undefined";
			if (!results[country]) results[country] = [];
			results[country].push(regions[i]);
		}
		instance.regionSearchResults.set(results);
	}
});
