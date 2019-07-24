import '/imports/Api';
import '/imports/utils/field-ordering';
import '/imports/utils/sort-spec';

WebApp.rawConnectHandlers.use('/api', (req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	return next();
});

const NoActionError = function (message) {
	this.message = message;
};

const jSendResponder = function (res, process) {
	try {
		const body = {
			status: 'success',
			data: process(),
		};
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json; charset=utf-8');
		res.end(JSON.stringify(body, null, '\t'));
	} catch (e) {
		const body = {};
		if (e instanceof FilteringReadError
		|| e instanceof NoActionError
		) {
			res.statusCode = 400;
			body.status = 'fail';
			body.data = {};
			if (e.name) {
				body.data[e.name] = e.message;
			} else {
				body.data.error = e.message;
			}
		} else {
			console.log(e, e.stack);
			res.statusCode = 500;
			body.status = 'error';
			body.message = 'Server error';
		}
		res.end(JSON.stringify(body, null, '\t'));
	}
};

Router.route('api.0.json', {
	path: '/api/0/json/:handler',
	where: 'server',
	action() {
		jSendResponder(this.response, () => {
			const { handler } = this.params;
			if (!Api.hasOwnProperty(handler)) {
				throw new NoActionError('Invalid action');
			}

			const { query } = this.params;

			const sortStr = query.sort;
			const sorting = sortStr ? SortSpec.fromString(sortStr) : SortSpec.unordered();

			const filter = Object.assign({}, query);
			delete filter.sort;
			delete filter.limit;
			delete filter.skip;

			const selectedLimit = Number.parseInt(query.limit, 10) || 100;
			const limit = Math.max(0, Math.min(100, selectedLimit));
			const skip = Number.parseInt(query.skip, 10) || 0;
			const results = Api[handler](filter, limit, skip, sorting.spec());

			// Sort the results again so computed fields are sorted too
			// WARNING: In many cases this will be too late, because the limit
			// has already excluded results.
			return FieldOrdering(sorting).sorted(results);
		});
	},
});
