Assistant = {
	init: function() {
		Session.set('ShowIntro', !localStorage.IntroDone);
	},
	showIntro: function() {
		if (Session.get('ShowIntro')) {
			return true;
		} else {
			var route = Router.current().route;
			var routeName = route && route.getName();
			return routeName === "home";
		}
	},
	openedIntro: function() {
		var route = Router.current().route;
		var routeName = route && route.getName();
		return routeName === "home" || routeName === "find";
	},
	doneIntro: function() {
		Session.set('ShowIntro', false);
		localStorage.IntroDone = true;
	}
};
