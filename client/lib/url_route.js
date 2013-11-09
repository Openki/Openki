return;
var URLliste = Backbone.Router.extend({
		// URLS auslesen ---------
		routes: {

			"locations/": "locationlist",
			"location/": "locationdetails",

			"courselist/": "courselist",

			"categorylist/": "categorylist",

			"course/:course_id": "coursedetails",
			"course/:course_id/:course_title": "coursedetails",

			"profile/": "profile",

			"": "home",

//			"user/": "userprofile",
			"user/:user_id": "userprofile",
			"user/:user_id/:user_name": "userprofile"
			},


		coursedetails: function (course_id, course_title){
			Session.set("selected_course", course_id);
			Session.set("page_id", "coursedetails");
		},

		locationlist: function (){
			Session.set("page_id", "locationlist");
		},

		locationdetails: function (location_id, location_title){
			Session.set("selected_location", course_id);
			Session.set("page_id", "locationdetails");
		},

		profile: function (){
			Session.set("page_id", "profile");
		},

		userprofile: function (user_id, user_name){
			Session.set("selected_user", user_id);
			Session.set("page_id", "userprofile");
		}



