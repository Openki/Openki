export default Predicates = {
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
