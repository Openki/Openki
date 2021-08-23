export function paramsToQueryString(params: { [name: string]: string | number | boolean }) {
	const queryParams = Object.entries(params).map(
		(nameValue) => `${encodeURIComponent(nameValue[0])}=${encodeURIComponent(nameValue[1])}`,
	);

	return queryParams.join('&');
}

/**
 * Get the value of a query parameter by name
 */
export function queryParam(name: string) {
	const params = document.location.search.substring(1).split('&');
	for (let i = 0; i < params.length; i += 1) {
		const keyval = params[i].split('=');
		if (decodeURIComponent(keyval[0]) === name) {
			return decodeURIComponent(keyval[1]);
		}
	}
	return undefined;
}
