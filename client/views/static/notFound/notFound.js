import '/imports/ui/components/report/report.js';

Template.notFound.events({
	"click .js-go-back": function(event, template){
		history.back();
	}
});
