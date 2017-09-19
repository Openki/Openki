import '/imports/Api.js';

WebApp.rawConnectHandlers.use("/api", function(req, res, next) {
	res.setHeader("Access-Control-Allow-Origin", "*");
	return next();
});

const NoActionError = function(message) {
	this.message = message;
}

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
			console.log(e)
			res.statusCode = 500;
			body.status = "error";
			body.message = "Server error";
		}
		res.end(JSON.stringify(body, null, "\t"));
	}
}

// Read a sorting specification of the form "name,-age" and return a function
// that sorts a list according to that spec.
const SortByFields = function(sortSpec) {
    // Return id function if there are no sort directives
    if (!sortSpec) return list => list;

    // Build chain of compare functions that refer to the next field
    // if the current field values are equal.
    const equal = (a, b) => 0;
    const fieldsCmp = sortSpec.split(',').reduceRight((lowerSort, fieldStr) => {
        const fieldCmp = field => { return (a, b) => {
            if (a[field] < b[field]) return -1;
            if (a[field] > b[field]) return 1;
            return lowerSort(a, b);
        } };

        if (fieldStr.indexOf('-') === 0) {
            // Revert the arguments for descending sort order
            return (a, b) => fieldCmp(fieldStr.slice(1))(b, a);
        }
        return fieldCmp(fieldStr);
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
				throw new NoActionError("Invalid action")
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
