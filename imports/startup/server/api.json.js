import '/imports/Api.js';

WebApp.rawConnectHandlers.use("/api", function(req, res, next) {
	res.setHeader("Access-Control-Allow-Origin", "*");
	return next();
});

const NoActionError = function(message) {
	this.message = message;
};

const jSendResponder = function(res, process) {
	try {
		let body =
			{ status: "success"
			, data: process()
			};
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json; charset=utf-8');
		res.end(JSON.stringify(body, null, "\t"));
	} catch(e) {
		let body = {};
		if (e instanceof FilteringReadError
		 || e instanceof NoActionError
		) {
			res.statusCode = 400;
			body.status = "fail";
			body.data = {};
			if (e.name) {
				body.data[e.name] = e.message;
			} else {
				body.data.error = e.message;
			}
		} else {
			console.log(e);
			res.statusCode = 500;
			body.status = "error";
			body.message = "Server error";
		}
		res.end(JSON.stringify(body, null, "\t"));
	}
};

// A general comparison function that uses localeCompare() when comparing
// strings.
const genComp = function(a, b) {
	if (typeof a === 'string' && typeof b === 'string') {
		// At the moment we don't provide a way to choose the locale :-(
		// So it will be sorted under whatever locale the server is running.
		return a.localeCompare(b);
	}
	if (a < b) return -1;
	if (a > b) return 1;
	return 0;
};

// Turn a sort specification of the form "name,-age" into a mongo
// sort-specifier of the form [['name', 'asc'], ['age', 'desc']].
const readSortSpec = function(spec) {
	if (!spec) return [];
	return spec.split(',').filter(Boolean).map((field) => {
		if (field.indexOf('-') === 0) {
			return [ field.slice(1), 'desc' ];
		}
		return [ field, 'asc' ];
	});
}


const SortBySpec = function(sortSpec) {
	// Build chain of compare functions that refer to the next field
	// if the current field values are equal.
	const equal = (a, b) => 0;
	const fieldsCmp = sortSpec.reduceRight((lowerSort, [ field, order ]) => {
		return (a, b) => {
			return order === 'asc' ? genComp(a, b) : genComp(b, a)
			    || lowerSort(a, b);
		};
	}, equal);

	return list => list.sort(fieldsCmp);
};

Router.route('api.0.json', {
	path: '/api/0/json/:handler',
	where: 'server',
	action: function() {
		jSendResponder(this.response, () => {
			let handler = this.params.handler;
			if (!Api.hasOwnProperty(handler)) {
				throw new NoActionError("Invalid action");
			}
			const query = this.params.query;
			const sort = readSortSpec(query.sort);
			const filter = Object.assign({}, query);
			delete filter.sort;
			delete filter.limit;
			delete filter.skip;

			const limit = Math.min(100, query.limit || 10);
			const skip = Number.parseInt(query.skip) || 0;
			const results = Api[handler](filter, limit, skip, sort);

			// Sort the results again so computed fields are sorted too
			return SortBySpec(sort)(results);
		});
	}
});
