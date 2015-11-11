Template.region_sel.helpers({
	regions: function(){
	  return Regions.find();
	},

	region: function(){
		var region = Regions.findOne(Session.get('region'))
		return region
	}
});

Template.region_sel.events({
	'click a.regionselect': function(e){
		var region_id = this._id ? this._id : 'all';
		var changed = Session.get('region') !== region_id;

		localStorage.setItem("region", region_id); // to survive page reload
		Session.set('region', region_id)

		// Go to the homepage when the region is changed
		if (changed) Router.go('/');

		e.preventDefault();
	}
})
