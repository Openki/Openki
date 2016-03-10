Template.small_event.rendered = function() {
	this.$('.-eventLocationTime').dotdotdot({
		height: 55,
		watch : "window",
	});
	this.$('.-eventTitle').dotdotdot({
		watch: "window",
	});
	this.$('.-eventDescription').dotdotdot({
		watch: "window",
	});
};
