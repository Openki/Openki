import '/imports/Api.js';

let NoActionError = function(message) {
	this.message = message;
}

let jSendResponder = function(res, process) {
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

Router.route('api.0.json', {
	path: '/api/0/json/:handler',
	where: 'server',
	action: function() {
		jSendResponder(this.response, () => {
			let handler = this.params.handler;
			if (!Api.hasOwnProperty(handler)) {
				throw new NoActionError("Invalid action")
			}
			let query = this.params.query;
			return Api[handler](query);
		});
	}
});
