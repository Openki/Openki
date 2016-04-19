"use strict";

Template.show_categories.events({
	"click .category": function(event, template){
		template.$("[data-toggle='tooltip']").tooltip('hide');
	}
});

Template.show_categories.rendered = function() {
	this.$("[data-toggle='tooltip']").tooltip();
};
