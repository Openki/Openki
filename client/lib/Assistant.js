Assistant = {
	init: function() {
		Session.set('ShowIntro', !localStorage.IntroDone);
	},
	showIntro: function() {
		return Session.get('ShowIntro');
	},
	doneIntro: function() {
		Session.set('ShowIntro', false);
		localStorage.IntroDone = true;
	}
};
