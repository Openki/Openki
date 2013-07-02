

var URLliste = Backbone.Router.extend({
		routes: {
			":parameter": "main",
			
			"kurs/:parameter2": "kurs",
			"kurs/:parameter2/:parameter3": "kurs"
		},
		main: function (huhu){
		alert("Hoi " + huhu);
		},
		
		kurs: function (kurs_id, kommentar){
			alert("Wilkommen beim Kurs  " + kurs_id + " - Dein Kommentar: " +kommentar);
		}
});

//alert("Hoi");
Router = new URLliste;

 Meteor.startup(function () {
		Backbone.history.start({pushState: true});
 });
 
