import moment from "moment";
import { union, difference, intersection, uniq } from "lodash-es";

import { FilteringReadError } from "./filtering";

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
  return string(param === "all" ? "" : param);
};

export const ids: Predicate<string[]> = function (param) {
  if (!param) {
    return undefined;
  }
  const make = function (values: string[]): ParamWrapper<string[]> {
    return {
      merge(other) {
        return make(union(values, other.get()));
      },
      without(predicate) {
        const diff = difference(values, predicate.get());
        if (diff.length === 0) {
          return undefined;
        }
        return make(diff);
      },
      get() {
        return values;
      },
      param() {
        return values.join(",");
      },
      query() {
        return values;
      },
      equals(other) {
        const otherIds = other.get();
        return (
          values.length === otherIds.length &&
          intersection(values, otherIds).length === values.length
        );
      },
    };
  };
  return make(uniq(param.split(",")));
};

export const flag: Predicate<boolean> = function (param) {
  if (param === undefined) {
    return undefined;
  }
  const state = Boolean(Number.parseInt(param, 2));

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
      return state ? "1" : "0";
    },
    query() {
      return state;
    },
    equals(other) {
      return other.get() === state;
    },
  };
};

export const integer: Predicate<number> = function (param) {
  if (param === undefined) {
    return undefined;
  }
  const state = Number.parseInt(param, 10);

  if (!Number.isInteger(state)) {
    throw new FilteringReadError("", "Invalid integer");
  }

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
      return state.toString();
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
    return undefined;
  }
  let value: moment.Moment;
  if (param === "now") {
    value = moment().startOf("minute");
  } else {
    value = moment(param, ["YYYY-MM-DD", moment.ISO_8601]); // Param is ISO date or moment() object
    if (!value.isValid()) {
      throw new FilteringReadError("", "Invalid date");
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

export function createEnumPredicate<T extends readonly string[]>(...values: readonly [...T]) {
  const enumPredicate: Predicate<T[number]> = function (param) {
    if (param === undefined) {
      return undefined;
    }

    const state = values.find((v) => v.toUpperCase() === param.toUpperCase());

    if (state === undefined) {
      throw new FilteringReadError("", "Invalid value");
    }

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
        return state;
      },
      query() {
        return state;
      },
      equals(other) {
        return other.get() === state;
      },
    };
  };

  return enumPredicate;
}

export function createEnumsPredicate<T extends readonly string[]>(...states: readonly [...T]) {
  const enumsPredicate: Predicate<T[number][]> = function (param) {
    if (param === undefined) {
      return undefined;
    }

    const make = function (params: string[]): ParamWrapper<T[number][]> {
      const values = params.map((v) => {
        const state = states.find((s) => s.toUpperCase() === v.toUpperCase());

        if (state === undefined) {
          throw new FilteringReadError("", "Invalid value");
        }
        return state;
      });

      return {
        merge(other) {
          return make(union(values, other.get()));
        },
        without(predicate) {
          const diff = difference(values, predicate.get());
          if (diff.length === 0) {
            return undefined;
          }
          return make(diff);
        },
        get() {
          return values;
        },
        param() {
          return values.join(",");
        },
        query() {
          return values;
        },
        equals(other) {
          const otherStates = other.get();
          return (
            values.length === otherStates.length &&
            intersection(values, otherStates).length === values.length
          );
        },
      };
    };
    return make(uniq(param.split(",")));
  };
  return enumsPredicate;
}
