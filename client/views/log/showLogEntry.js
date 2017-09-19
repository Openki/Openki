TemplateMixins.MultiExpandible(Template.showLogEntry);
Template.showLogEntry.helpers(
	{ date:
		function() {
			const date = Template.instance().filter.toParams().date;
			return date && date.toISOString() || "";
		}
	, shortId:
		function(id) {
			return id.substr(0, 8);
		}
	, isodate:
		function(date) {
			return moment(date).toISOString();
		}
	, jsonBody:
		function() {
			return JSON.stringify(this.body, null, '   ');
		}
	}
);
