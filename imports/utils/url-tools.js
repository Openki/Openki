import { _ } from 'meteor/underscore';

const UrlTools = {
	/**
	 * @param {{[name:string]:string|number|boolean}} params
	 */
	paramsToQueryString(params) {
		const queryParams = _.map(params, (param, name) => `${encodeURIComponent(name)}=${encodeURIComponent(param)}`);

		return queryParams.join('&');
	},

	/**
	 * Get the value of a query parameter by name
	 * @param {string} name
	 */
	queryParam(name) {
		const params = document.location.search.substring(1).split('&');
		for (let i = 0; i < params.length; i += 1) {
			const keyval = params[i].split('=');
			if (decodeURIComponent(keyval[0]) === name) {
				return decodeURIComponent(keyval[1]);
			}
		}
		return undefined;
	},
};

export default UrlTools;
