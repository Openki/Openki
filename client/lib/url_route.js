var URLliste = Backbone.Router.extend({
		// URLS auslesen ---------
		routes: {
			"": "home",
			
			"page/:page_id": "pages",
			
			"locations/": "locationlist",
			"location/": "locationdetails",
			
			"courselist/": "courselist",

			"categorylist/": "categorylist",
			
			"course/:course_id": "coursedetails",
			"course/:course_id/:course_title": "coursedetails",

			"profile/": "profile"
			
			},
		
		home: function (){	
			Session.set("page_id", "home");
		},	
		
		pages: function (page_id){
			Session.set("page_id", page_id);
		},

		courselist: function (){
			Session.set("page_id", "courselist");
		},

		categorylist: function (){
			Session.set("page_id", "categorylist");
		},
		
		coursedetails: function (course_id, course_title){	
			Session.set("selected_course", course_id);
			Session.set("page_id", "coursedetails");
		},
		
		locationlist: function (){
			Session.set("page_id", "locationlist");
		},
		
		locationdetails: function (course_id, course_title){	
			Session.set("selected_location", course_id);
			Session.set("page_id", "locationdetails");
		},

		
		profile: function (){
			Session.set("page_id", "profile");
		},
		
		// URLS setzen ---------
		setCourse: function (course_id,course_title) {
		  	this.navigate("course/"+course_id+"/"+course_title.replace(/ /g,"_"), true);
		}
});

Router = new URLliste;

 Meteor.startup(function () {
		Backbone.history.start({pushState: true});
 });
 

