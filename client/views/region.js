Template.maincontent.helpers({
		hasRegions: function(){
		  return Regions.find().count();
		},
		regions: function(){
		  return Regions.find();
		}
});