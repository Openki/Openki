var Predicates = {
	string: function(param) {
		return {
			merge: function(other) { return other; },
			without: function(predicate) { return false; },
			get: function() { return param; },
			param: function() { return param; },
			query: function() { return param; },
			equals: function(other) { return param === other.get(); }
		};
	},
	id: function(param) {
		if (param == 'all') return false;
		return Predicates.string(param);
	},
	ids: function(param) {
		var make = function(ids) {
			return {
				merge: function(other) { return make(_.union(ids, other.get())); },
				without: function(predicate) {
					ids = _.difference(ids, predicate.get());
					if (ids.length === 0) return false;
					return make(ids);
				},
				get: function() { return ids; },
				param: function() { return ids.join(','); },
				query: function() { return ids; },
				equals: function(other) {
					var otherIds = other.get();
					return (
						ids.length === otherIds.length
						&& _.intersection(ids, otherIds).length === ids.length
					);
				}
			};
		};
		return make(_.uniq(param.split(',')));
	},
	require: function(param) {
		if (!param) return false;
		return {
			merge: function(other) { return other; },
			without: function(predicate) { return false; },
			get: function() { return true; },
			param: function() { return '1'; },
			query: function() { return true; },
			equals: function(other) { return true; }
		};
	},
	flag: function(param) {
		if (param === undefined) return false;
		var state = !!parseInt(param, 2); // boolean

		return {
			merge: function(other) { return other; },
			without: function(predicate) { return false; },
			get: function() { return state; },
			param: function() { return state ? 1 : 0; },
			query: function() { return state; },
			equals: function(other) { return other.get() === state; }
		};
	},
	date: function(param) {
		if (!param) throw new FilteringReadError(param, "Empty date");
		var date;

		if (param === 'now') {
			date = moment.utc();
		} else {
			date = moment.utc(param, ["YYYY-MM-DD", moment.ISO_8601]); // Param is ISO date or moment() object
			if (!date.isValid()) throw new FilteringReadError(param, "Invalid date");
		}

		return {
			merge: function(other) { return other; },
			without: function(predicate) { return false; },
			get: function() { return moment(date); },
			param: function() { return date.toISOString(); },
			query: function() { return date.toDate(); },
			equals: function(other) { return date.isSame(other.get()); }
		};
	},
};

CoursePredicates = {
	region: Predicates.id,
	search: Predicates.string,
	group: Predicates.string,
	categories: Predicates.ids,
	state: Predicates.string,
	needsRole: Predicates.ids,
	internal:  Predicates.flag
};

EventPredicates = {
	course: Predicates.id,
	region: Predicates.id,
	search: Predicates.string,
	categories: Predicates.ids,
	group: Predicates.id,
	groups: Predicates.ids,
	venue:  Predicates.string,
	room:  Predicates.string,
	start: Predicates.date,
	before: Predicates.date,
	after: Predicates.date,
	end: Predicates.date,
	internal:  Predicates.flag,
};

GroupPredicates = {
       tags: Predicates.ids,
};

VenuePredicates = {
	region: Predicates.id,
};

LogPredicates =
	{ start: Predicates.date
	, rel: Predicates.ids
	, tr: Predicates.ids
	};



Filtering = function(availablePredicates) {
	var self = {};
	var predicates = {};
	var settledPredicates = {};
	var dep = new Tracker.Dependency();

	self.clear = function() { predicates = {}; return this; };

	self.get = function(name) {
		if (Tracker.active) dep.depend();
		if (!settledPredicates[name]) return undefined;
		return settledPredicates[name].get();
	};

	self.add = function(name, param) {
		try {
			if (!availablePredicates[name]) throw new FilteringReadError(param, "No predicate "+name);
			var toAdd = availablePredicates[name](param);
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

	self.read = function(list) {
		for (var name in list) {
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

	self.readAndValidate = function(list) {
		for (var name in list) {
			self.add(name, list[name]);
		}
		return self;
	};

	self.remove = function(name, param) {
		var toRemove = availablePredicates[name](param);
		if (predicates[name]) {
			predicates[name] = predicates[name].without(toRemove);
		}
		if (!predicates[name]) delete predicates[name];
		return self;
	};

	self.toggle = function(name, param) {
		if (self.get(name) && self.get(name).indexOf(param) >= 0) {
			self.remove(name, param);
		} else {
			self.add(name, param);
		}
		return self;
	};

	self.disable = function(name) {
		delete predicates[name];
		return self;
	};

	self.done = function() {
		var settled = settledPredicates;
		settledPredicates = _.clone(predicates);

		// Now find out whether the predicates changed
		var settlingNames = Object.keys(predicates);
		var settledNames = Object.keys(settled);

		var same = settlingNames.length === settledNames.length
		        && _.intersection(settlingNames, settledNames).length === settlingNames.length;

		if (same) {
			// Look closer
			for (var name in predicates) {
				same = predicates[name].equals(settled[name]);
				if (!same) break;
			}
		}
		if (!same) dep.changed();
		return self;
	};

	self.toParams = function() {
		if (Tracker.active) dep.depend();
		var params = {};
		for (var name in settledPredicates) {
			params[name] = settledPredicates[name].param();
		}
		return params;
	};

	self.toQuery = function() {
		if (Tracker.active) dep.depend();
		var query = {};
		for (var name in settledPredicates) {
			query[name] = settledPredicates[name].query();
		}
		return query;
	};

	return self;
};

FilteringReadError = function(param, message) {
	this.param = param;
	this.message = message;
};
