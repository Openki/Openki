Router.map(function () {
	this.route('locations',{
		path: 'locations',
		template: 'locationlist',
		waitOn: function () {
			return Meteor.subscribe('locations');
		},
		onAfterAction: function() {
			document.title = webpagename + 'Location list'
		}
	})
});

Template.locationlist.locations=function(){
	var region = Session.get('region')
	var regionObj = Regions.findOne(region)
	var regionName = regionObj ? regionObj.name : 'All regions'
	if (regionName !== "All regions") {
		query={region: region};
    }else{
    	query={};
    }
	var locations = Locations.find(query);
	for(m = 0; m < locations.count(); m++){
		loc = locations.db_objects[m];
		if(loc.hosts && loc.hosts.indexOf(Meteor.userId()) != -1){
			loc.ismylocation = "true";
		}
	}

	if(Meteor.userId()) {
		Session.set("locationHosts",[Meteor.userId()]) // Variable brauchts für das New-Location-Formular. Hier wohl nicht so logisch, wo hintun?
	}

	return locations;
}

Template.locationlist.region=function(){
	var regionId = Session.get('region')
	var regionObj = Regions.findOne(regionId)
	var regionName = regionObj ? regionObj.name : 'all regions'
	return regionName
}



