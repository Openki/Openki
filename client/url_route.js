var URLliste = Backbone.Router.extend({
		// URLS auslesen ---------
		routes: {
			"": "home",
			
			"page/:page_id": "pages",
			
			"courselist/": "courselist",
			
			"course/:course_id": "coursedetails",
			"course/:course_id/:course_title": "coursedetails",

			"profile/": "profile"
			
			},
		
		home: function (){	
			Session.set("page_id", "home");
		},

		courselist: function (){
			Session.set("page_id", "courselist");
		},
		
		coursedetails: function (course_id, course_title){	
			Session.set("selected_course", course_id);
			Session.set("page_id", "coursedetails");
		},
		
		pages: function (page_id){
			Session.set("page_id", page_id);
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
 
 
Template.maincontent.route_is = function (data,options) {
// strube funktion, die irgendwas macht, aber es tut
// macht, dass das routing im template "maincontent" funtkioniert
  if ( Session.equals( 'page_id', data ) ) {
			return options.fn( this );
		}
		return options.inverse( this );
    };
