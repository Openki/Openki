const Filtering = function (availablePredicates) {
	const self = {};
	let predicates = {};
	let settledPredicates = {};
	const dep = new Tracker.Dependency();

	self.clear = function () { predicates = {}; return this; };

	self.get = function (name) {
		if (Tracker.active) dep.depend();
		if (!settledPredicates[name]) return undefined;
		return settledPredicates[name].get();
	};

	self.add = function (name, param) {
		try {
			if (!availablePredicates[name]) throw new FilteringReadError(param, `No predicate ${name}`);
			const toAdd = availablePredicates[name](param);
			if (toAdd === undefined) return; // Filter construction failed, leave as-is

			if (predicates[name]) {
				predicates[name] = predicates[name].merge(toAdd);
			} else {
				predicates[name] = toAdd;
			}
			if (!predicates[name]) delete predicates[name];
			return self;
		} catch (e) {
			if (e instanceof FilteringReadError) {
				e.name = name;
			}
			throw e;
		}
	};

	self.read = function (list) {
		// eslint-disable-next-line guard-for-in
		for (const name in list) {
			try {
				self.add(name, list[name]);
			} catch (e) {
				if (e instanceof FilteringReadError) {
					// ignored
				} else {
					throw e;
				}
			}
		}
		return self;
	};

	self.readAndValidate = function (list) {
		// eslint-disable-next-line guard-for-in
		for (const name in list) {
			self.add(name, list[name]);
		}
		return self;
	};

	self.remove = function (name, param) {
		const toRemove = availablePredicates[name](param);
		if (predicates[name]) {
			predicates[name] = predicates[name].without(toRemove);
		}
		if (!predicates[name]) delete predicates[name];
		return self;
	};

	self.toggle = function (name, param) {
		if (self.get(name) && self.get(name).indexOf(param) >= 0) {
			self.remove(name, param);
		} else {
			self.add(name, param);
		}
		return self;
	};

	self.disable = function (name) {
		delete predicates[name];
		return self;
	};

	self.done = function () {
		const settled = settledPredicates;
		settledPredicates = _.clone(predicates);

		// Now find out whether the predicates changed
		const settlingNames = Object.keys(predicates);
		const settledNames = Object.keys(settled);

		let same = settlingNames.length === settledNames.length
				&& _.intersection(settlingNames, settledNames).length === settlingNames.length;

		if (same) {
			// Look closer
			// eslint-disable-next-line guard-for-in
			for (const name in predicates) {
				same = predicates[name].equals(settled[name]);
				if (!same) break;
			}
		}
		if (!same) dep.changed();
		return self;
	};

	self.toParams = function () {
		if (Tracker.active) dep.depend();
		const params = {};
		// eslint-disable-next-line guard-for-in
		for (const name in settledPredicates) {
			params[name] = settledPredicates[name].param();
		}
		return params;
	};

	self.toQuery = function () {
		if (Tracker.active) dep.depend();
		const query = {};
		// eslint-disable-next-line guard-for-in
		for (const name in settledPredicates) {
			query[name] = settledPredicates[name].query();
		}
		return query;
	};

	return self;
};

export default Filtering;

FilteringReadError = function (param, message) {
	this.param = param;
	this.message = message;
};
