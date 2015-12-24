UrlTools = {
	paramsToQueryString: function(params) {
		var queryParams = _.map(params, function(param, name) {
			return encodeURIComponent(name) + '=' + encodeURIComponent(param);
		});

		return queryParams.join('&');
	},
};