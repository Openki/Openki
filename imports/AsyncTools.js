export default AsyncTools = {};

AsyncTools.checkUpdateOne = function(err, aff) {
	if (err) throw err;
	if (aff != 1) throw "Query affected "+aff+" docs, expected 1";
};
