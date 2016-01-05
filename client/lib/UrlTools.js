UrlTools = {
	paramsToQueryString: function(params) {
		var queryParams = _.map(params, function(param, name) {
			return encodeURIComponent(name) + '=' + encodeURIComponent(param);
		});

		return queryParams.join('&');
	},

	// Get the value of a query parameter by name
	// returns parameter value as string or undefined
	queryParam: function(name) {
		var params = location.search.substring(1).split('&');
		for (var i in params) {
			var keyval = params[i].split('=');
			if (keyval[0] === name) return keyval[1];
		}
		return undefined;
	}
};