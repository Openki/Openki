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

// Read a sorting specification of the form "name,-age" and return a function
// that sorts a list according to that spec.
const SortByFields = function(sortSpec) {
	// Return id function if there are no sort directives
	if (!sortSpec) return list => list;

	// Build chain of compare functions that refer to the next field
	// if the current field values are equal.
	const equal = (a, b) => 0;
	const fieldsCmp = sortSpec.split(',').reduceRight((lowerSort, fieldStr) => {
		const cmpChain = (a, b) => {
			return genComp(a, b) || lowerSort(a, b);
		};

		// Descending case
		if (fieldStr.indexOf('-') === 0) {
			let field = fieldStr.slice(1);
			// Revert the arguments for descending sort order
			return (a, b) => cmpChain(b[field], a[field]);
		}

		// Ascending case
		return (a, b) => cmpChain(a[fieldStr], b[fieldStr]);
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
			const sortSpec = query.sort;
			const order = SortByFields(sortSpec);
			const filter = Object.assign({}, query);
			delete filter.sort;

			return order(Api[handler](filter));
		});
	}
});
