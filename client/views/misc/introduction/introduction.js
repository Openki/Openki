Template.layout.onRendered(function() {
	if (!Assistant.openedIntro()) {
		this.$('.content').hide();
	}

	var instance = this;
	this.autorun(function() {
		if (Assistant.openedIntro()) {
			instance.$('.content').slideDown(400);
		} else {
			instance.$('.content').slideUp(400);
		}
	});
});


Template.layout.helpers({
	shownIntro: function() {
		return Assistant.shownIntro();
	}
});

Template.introduction.helpers({
	openedIntro: function() {
		return Assistant.openedIntro();
	}
});


Template.layout.events({
	// Clicks on the logo toggle the intro blurb, but only when already on home
	'click .-toggleIntro': function() {
		if (Router.current().route.options.template === "findWrap") {
			Assistant.showIntro();
		}
	},

	"click .js-hide-intro": function(event, instance) {
		Assistant.doneIntro();
	},

	"click .js-toggle-details": function(event, instance) {
		if (Assistant.openedIntro()) {
			Assistant.closeIntro();
		} else {
			Assistant.openIntro();
		}
	}
});
