import { _ } from 'meteor/underscore';
import moment from 'moment';
import { FilteringReadError } from './filtering';

export interface ParamWrapper<G = any, Q = G> {
	merge(other: ParamWrapper<G, Q>): ParamWrapper<G, Q>;
	without(predicate: ParamWrapper<G, Q>): ParamWrapper<G, Q> | undefined;
	get(): G;
	param(): string;
	query(): Q;
	equals(other: ParamWrapper): boolean;
}

export type Predicate<G, Q = G, P = string> = (param: P) => ParamWrapper<G, Q> | undefined;

export const string: Predicate<string> = function (param: string) {
	return {
		merge(other) {
			return other;
		},
		without() {
			return undefined;
		},
		get() {
			return param;
		},
		param() {
			return param;
		},
		query() {
			return param;
		},
		equals(other) {
			return param === other.get();
		},
	};
};

export const id: Predicate<string> = function (param) {
	if (param === 'all') {
		return undefined;
	}
	return string(param);
};

export const ids: Predicate<string[]> = function (param) {
	const make = function (values: string[]): ParamWrapper<string[]> {
		return {
			merge(other) {
				return make(_.union(values, other.get()));
			},
			without(predicate) {
				const diff = _.difference(values, predicate.get());
				if (diff.length === 0) {
					return undefined;
				}
				return make(diff);
			},
			get() {
				return values;
			},
			param() {
				return values.join(',');
			},
			query() {
				return values;
			},
			equals(other) {
				const otherIds = other.get();
				return (
					values.length === otherIds.length &&
					_.intersection(values, otherIds).length === values.length
				);
			},
		};
	};
	return make(_.uniq(param.split(',')));
};

export const flag: Predicate<boolean> = function (param) {
	if (param === undefined) {
		return undefined;
	}
	const state = Boolean(parseInt(param, 2));

	return {
		merge(other) {
			return other;
		},
		without() {
			return undefined;
		},
		get() {
			return state;
		},
		param() {
			return state ? '1' : '0';
		},
		query() {
			return state;
		},
		equals(other) {
			return other.get() === state;
		},
	};
};

export const date: Predicate<moment.Moment, Date, string | moment.Moment> = function (param) {
	if (!param) {
		throw new FilteringReadError('', 'Empty date');
	}
	let value: moment.Moment;
	if (param === 'now') {
		value = moment();
	} else {
		value = moment(param, ['YYYY-MM-DD', moment.ISO_8601]); // Param is ISO date or moment() object
		if (!value.isValid()) {
			throw new FilteringReadError('', 'Invalid date');
		}
	}

	return {
		merge(other) {
			return other;
		},
		without() {
			return undefined;
		},
		get() {
			return moment(value);
		},
		param() {
			return value.toISOString();
		},
		query() {
			return value.toDate();
		},
		equals(other) {
			return value.isSame(other.get());
		},
	};
};
