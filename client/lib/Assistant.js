Assistant = {
	init: function() {
		Session.set('ShowIntro', !localStorage.IntroDone);
	},
	showIntro: function() {
		return Session.get('ShowIntro');
	},
	openedIntro: function() {
		var routeName = Router.current().route.getName();
		return routeName === "home" || routeName === "find";
	},
	doneIntro: function() {
		Session.set('ShowIntro', false);
		localStorage.IntroDone = true;
	}
};
