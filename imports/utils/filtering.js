import { _ } from 'meteor/underscore';

export class FilteringReadError {
	/**
	 * @param {string} name
	 * @param {string} message
	 */
	constructor(name, message) {
		this.name = name;
		this.message = message;
	}
}

/** @typedef {import('./predicates').Predicate} Predicate */
/** @typedef {import('./predicates').ParamWrapper} ParamWrapper */

class Filtering {
	/**
	 * @param {{[name:string]: Predicate}} availablePredicates
	 */
	constructor(availablePredicates) {
		this._availablePredicates = availablePredicates;

		/** @type {{[name:string]:ParamWrapper;}} */
		this._predicates = {};
		/** @type {{[name:string]:ParamWrapper;}} */
		this._settledPredicates = {};
		this._dep = new Tracker.Dependency();
	}


	clear() {
		this._predicates = {};
		return this;
	}

	/**
	 * @param {string} name
	 */
	get(name) {
		if (Tracker.active) {
			this._dep.depend();
		}
		if (!this._settledPredicates[name]) {
			return undefined;
		}
		return this._settledPredicates[name].get();
	}

	/**
	 * @param {string} name
	 * @param {string} param
	 */
	add(name, param) {
		try {
			if (!this._availablePredicates[name]) {
				throw new FilteringReadError(param, `No predicate ${name}`);
			}
			const toAdd = this._availablePredicates[name](param);
			if (toAdd === undefined) {
				return false; // Filter construction failed, leave as-is
			}

			if (this._predicates[name]) {
				this._predicates[name] = this._predicates[name].merge(toAdd);
			} else {
				this._predicates[name] = toAdd;
			}
			if (!this._predicates[name]) {
				delete this._predicates[name];
			}
			return this;
		} catch (e) {
			if (e instanceof FilteringReadError) {
				e.name = name;
			}
			throw e;
		}
	}

	/**
	 * @param {{ [name: string]: string; }} list
	 */
	read(list) {
		Object.keys(list).forEach((name) => {
			try {
				this.add(name, list[name]);
			} catch (e) {
				if (e instanceof FilteringReadError) {
					// ignored
				} else {
					throw e;
				}
			}
		});
		return this;
	}

	/**
	 * @param {{ [name: string]: string; }} list
	 */
	readAndValidate(list) {
		Object.keys(list).forEach((name) => this.add(name, list[name]));
		return this;
	}

	/**
	 * @param {string} name
	 * @param {string} param
	 */
	remove(name, param) {
		const toRemove = this._availablePredicates[name](param);
		if (this._predicates[name]) {
			this._predicates[name] = this._predicates[name].without(toRemove);
		}
		if (!this._predicates[name]) {
			delete this._predicates[name];
		}
		return this;
	}


	/**
	 * @param {string} name
	 * @param {string} param
	 */
	toggle(name, param) {
		if (this.get(name)?.indexOf(param) >= 0) {
			this.remove(name, param);
		} else {
			this.add(name, param);
		}
		return this;
	}

	/**
	 * @param {string} name
	 */
	disable(name) {
		delete this._predicates[name];
		return this;
	}

	done() {
		const settled = this._settledPredicates;
		this._settledPredicates = _.clone(this._predicates);

		// Now find out whether the predicates changed
		const settlingNames = Object.keys(this._predicates);
		const settledNames = Object.keys(settled);

		let same = settlingNames.length === settledNames.length
			&& _.intersection(settlingNames, settledNames).length === settlingNames.length;

		if (same) {
			// Look closer
			Object.keys(this._predicates).every((name) => {
				same = this._predicates[name].equals(settled[name]);
				return same;
			});
		}
		if (!same) {
			this._dep.changed();
		}
		return this;
	}

	toParams() {
		if (Tracker.active) {
			this._dep.depend();
		}
		/** @type {{[name:string]:string;}} */
		const params = {};
		Object.keys(this._settledPredicates).forEach((name) => {
			params[name] = this._settledPredicates[name].param();
		});
		return params;
	}

	toQuery() {
		if (Tracker.active) {
			this._dep.depend();
		}
		/** @type {{[name:string]:any;}} */
		const query = {};
		Object.keys(this._settledPredicates).forEach((name) => {
			query[name] = this._settledPredicates[name].query();
		});
		return query;
	}
}

export default Filtering;

