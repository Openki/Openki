Template.backToLink.helpers({
	previousRoute: function() {
		var previousRouteName = Session.get("previousRouteName");
		return mf('route.'+previousRouteName);
	}
});

Template.backToLink.events({
	"click .js-back-to-link": function(event, template){
		history.back();
	}
});
