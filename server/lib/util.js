// Simple async callback receiver that logs eventual errors
logAsyncErrors = function(err, ret) {
	if (err) {
		console.log(err);
	}
	return ret;
}