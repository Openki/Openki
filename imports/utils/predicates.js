import { _ } from 'meteor/underscore';
import moment from 'moment';
import { FilteringReadError } from './filtering';

/**
 * @typedef {{
    merge(other: ParamWrapper): ParamWrapper;
    without(predicate: ParamWrapper): boolean;
    get(): any;
    param(): string;
    query(): any;
    equals(other: ParamWrapper): boolean;
}} ParamWrapper
 */

/**
 * @callback Predicate
 * @param {string} param
 * @returns {ParamWrapper | false}
 */

const Predicates = {
	/**
	 * @type Predicate
	 */
	string(param) {
		return {
			merge(other) {
				return other;
			},
			without() {
				return false;
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
	},

	/**
	 * @type Predicate
	 */
	id(param) {
		if (param === 'all') {
			return false;
		}
		return Predicates.string(param);
	},

	/**
	 * @type Predicate
	 */
	ids(param) {
		/**
		 * @param {string[]} ids
		 * @returns {ParamWrapper | false}
		 */
		const make = function (ids) {
			return {
				merge(other) {
					return make(_.union(ids, other.get()));
				},
				without(predicate) {
					/* eslint-disable-next-line no-param-reassign */
					ids = _.difference(ids, predicate.get());
					if (ids.length === 0) {
						return false;
					}
					return make(ids);
				},
				get() {
					return ids;
				},
				param() {
					return ids.join(',');
				},
				query() {
					return ids;
				},
				equals(other) {
					const otherIds = other.get();
					return (
						ids.length === otherIds.length && _.intersection(ids, otherIds).length === ids.length
					);
				},
			};
		};
		return make(_.uniq(param.split(',')));
	},

	/**
	 * @type Predicate
	 */
	require(param) {
		if (!param) {
			return false;
		}
		return {
			merge(other) {
				return other;
			},
			without() {
				return false;
			},
			get() {
				return true;
			},
			param() {
				return '1';
			},
			query() {
				return true;
			},
			equals() {
				return true;
			},
		};
	},

	/**
	 * @type Predicate
	 */
	flag(param) {
		if (param === undefined) {
			return false;
		}
		const state = Boolean(parseInt(param, 2));

		return {
			merge(other) {
				return other;
			},
			without() {
				return false;
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
	},

	/**
	 * @type Predicate
	 */
	date(param) {
		if (!param) {
			throw new FilteringReadError(param, 'Empty date');
		}
		/** @type {moment.Moment} */
		let date;
		if (param === 'now') {
			date = moment();
		} else {
			date = moment(param, ['YYYY-MM-DD', moment.ISO_8601]); // Param is ISO date or moment() object
			if (!date.isValid()) {
				throw new FilteringReadError(param, 'Invalid date');
			}
		}

		return {
			merge(other) {
				return other;
			},
			without() {
				return false;
			},
			get() {
				return moment(date);
			},
			param() {
				return date.toISOString();
			},
			query() {
				return date.toDate();
			},
			equals(other) {
				return date.isSame(other.get());
			},
		};
	},
};

export default Predicates;
