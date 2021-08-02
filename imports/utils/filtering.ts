import { _ } from 'meteor/underscore';
import { Tracker } from 'meteor/tracker';
import { ParamWrapper, Predicate } from './predicates';

export class FilteringReadError {
	// eslint-disable-next-line no-useless-constructor
	constructor(public name: string, public message: string) {}
}

export class Filtering<T extends { [name: string]: Predicate<any> }> {
	private _predicates: { [name in keyof T]+?: ReturnType<T[name]> } = {};

	private _settledPredicates: { [name in keyof T]+?: ReturnType<T[name]> } = {};

	private _dep = new Tracker.Dependency();

	// eslint-disable-next-line no-useless-constructor
	constructor(private _availablePredicates: T) {}

	clear() {
		this._predicates = {};
		return this;
	}

	get(name: keyof T) {
		if (Tracker.active) {
			this._dep.depend();
		}

		const predicate = this._settledPredicates[name];
		if (!predicate) {
			return undefined;
		}
		return predicate.get();
	}

	add(name: keyof T, param: string) {
		try {
			if (!this._availablePredicates[name]) {
				throw new FilteringReadError('', `No predicate ${name}`);
			}
			const toAdd = this._availablePredicates[name](param);
			if (!toAdd) {
				return false; // Filter construction failed, leave as-is
			}

			const predicate = this._predicates[name];

			if (predicate) {
				this._predicates[name] = predicate.merge(toAdd) as any;
			} else {
				this._predicates[name] = toAdd as any;
			}
			if (!predicate) {
				delete this._predicates[name];
			}
			return this;
		} catch (e) {
			if (e instanceof FilteringReadError) {
				e.name = name as string;
			}
			throw e;
		}
	}

	read(list: { [name in keyof T]: string }) {
		Object.keys(list).forEach((name) => {
			try {
				this.add(name, list[name]);
			} catch (e) {
				if (!(e instanceof FilteringReadError)) {
					throw e;
				}
			}
		});
		return this;
	}

	readAndValidate(list: { [name in keyof T]: string }) {
		Object.keys(list).forEach((name) => this.add(name, list[name]));
		return this;
	}

	remove(name: keyof T, param: string) {
		try {
			if (!this._availablePredicates[name]) {
				throw new FilteringReadError('', `No predicate ${name}`);
			}
			const toRemove = this._availablePredicates[name](param);

			const predicate = this._predicates[name];
			if (predicate) {
				(this._predicates[name] as any) = predicate.without(toRemove as any);
			}
			if (!this._predicates[name]) {
				delete this._predicates[name];
			}
			return this;
		} catch (e) {
			if (e instanceof FilteringReadError) {
				e.name = name as string;
			}
			throw e;
		}
	}

	/** eg. for flag */
	toggle(name: keyof T): Filtering<T>;

	/** eg. for string and id */
	toggle(name: keyof T, param?: string) {
		if (!param) {
			// overload: toggle(name)
			if (this.get(name)) {
				this.disable(name);
			} else {
				this.add(name, '1');
			}
		}
		// overload: toggle(name, param)
		else if (this.get(name)?.includes(param)) {
			this.remove(name, param);
		} else {
			this.add(name, param);
		}

		return this;
	}

	disable(name: keyof T) {
		delete this._predicates[name];
		return this;
	}

	done() {
		const settled = this._settledPredicates;
		this._settledPredicates = _.clone(this._predicates);

		// Now find out whether the predicates changed
		const settlingNames = Object.keys(this._predicates);
		const settledNames = Object.keys(settled);

		let same =
			settlingNames.length === settledNames.length &&
			_.intersection(settlingNames, settledNames).length === settlingNames.length;

		if (same) {
			// Look closer
			Object.keys(this._predicates).every((name) => {
				same = (this._predicates[name] as any).equals(settled[name]);
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
		const params: { [name in keyof T]+?: string } = {};
		Object.keys(this._settledPredicates).forEach((name) => {
			params[name as keyof T] = (this._settledPredicates[name] as any).param();
		});
		return params;
	}

	toQuery() {
		if (Tracker.active) {
			this._dep.depend();
		}
		const query: {
			[name in keyof T]+?: ReturnType<Extract<ReturnType<T[name]>, ParamWrapper>['query']>;
		} = {};
		Object.keys(this._settledPredicates).forEach((name) => {
			query[name as keyof T] = (this._settledPredicates[name] as any).query();
		});
		return query;
	}
}

export default Filtering;
