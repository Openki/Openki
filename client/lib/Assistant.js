Assistant = {
	init: function() {
		Session.set('ShowIntro', localStorage.getItem('intro') !== 'done');
		Session.set('OpenedIntro', undefined);
	},

	showIntro: function() {
		Session.set('ShowIntro', true);
	},

	shownIntro: function() {
		return Session.get('ShowIntro');
	},

	openedIntro: function() {
		var opened = Session.get('OpenedIntro');
		if (opened !== undefined) return opened;

		var route = Router.current().route;
		var routeName = route && route.getName();
		return routeName === "home" || routeName === "find";
	},

	openIntro: function() {
		Session.set('OpenedIntro', true);
	},

	closeIntro: function() {
		Session.set('OpenedIntro', false);
	},

	doneIntro: function() {
		Session.set('ShowIntro', false);
		localStorage.setItem('intro', 'done');
	},
};
