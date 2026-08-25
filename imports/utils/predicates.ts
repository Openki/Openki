import moment from "moment";
import { union, difference, intersection, uniq } from "lodash-es";

import { FilteringReadError } from "./filtering";

export interface StateWrapper<State = unknown, Query = State> {
  merge(other: StateWrapper<State, Query>): StateWrapper<State, Query>;
  without(other: StateWrapper<State, Query>): StateWrapper<State, Query> | undefined;
  get(): State;
  param(): string;
  query(): Query;
  equals(other: StateWrapper<State, Query>): boolean;
}

export type Predicate<State, Query = State> = (
  paramOrState: string | State,
) => StateWrapper<State, Query> | undefined;

export const string: Predicate<string> = function (paramOrState) {
  if (paramOrState === "") {
    return undefined;
  }

  const state = paramOrState;
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
      return state === other.get();
    },
  };
};

export const id: Predicate<string> = function (paramOrState) {
  return string(paramOrState === "all" ? "" : paramOrState);
};

export const ids: Predicate<string[]> = function (paramOrState) {
  if (paramOrState === "") {
    return undefined;
  }

  let state;
  if (typeof paramOrState === "string") {
    state = paramOrState.split(",");
  } else {
    state = paramOrState;
  }

  if (state.length === 0) {
    return undefined;
  }

  state = uniq(state);

  return {
    merge(other) {
      return ids(union(state, other.get())) as StateWrapper<string[], string[]>;
    },
    without(predicate) {
      return ids(difference(state, predicate.get()));
    },
    get() {
      return state;
    },
    param() {
      return state.join(",");
    },
    query() {
      return state;
    },
    equals(other) {
      const otherIds = other.get();
      return (
        state.length === otherIds.length && intersection(state, otherIds).length === state.length
      );
    },
  };
};

export const flag: Predicate<boolean> = function (paramOrState) {
  if (paramOrState === "") {
    return undefined;
  }

  let state;
  if (typeof paramOrState === "string") {
    const int = Number.parseInt(paramOrState, 10);
    if (int === 1) {
      state = true;
    } else if (int === 0) {
      state = false;
    } else {
      throw new FilteringReadError("", "Invalid boolean");
    }
  } else {
    state = paramOrState;
  }

  if (typeof state !== "boolean") {
    throw new FilteringReadError("", "Invalid boolean");
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

export const integer: Predicate<number> = function (paramOrState) {
  if (paramOrState === "") {
    return undefined;
  }

  let state;
  if (typeof paramOrState === "string") {
    state = Number.parseInt(paramOrState, 10);
  } else {
    state = paramOrState;
  }

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

export const date: Predicate<moment.Moment, Date> = function (paramOrState) {
  if (paramOrState === "") {
    return undefined;
  }

  let state;
  if (paramOrState === "now") {
    state = moment().startOf("minute");
  } else {
    state = moment(paramOrState, ["YYYY-MM-DD", moment.ISO_8601]); // Param is ISO date or moment() object
  }

  if (!state.isValid()) {
    throw new FilteringReadError("", "Invalid date");
  }

  return {
    merge(other) {
      return other;
    },
    without() {
      return undefined;
    },
    get() {
      return moment(state);
    },
    param() {
      return state.format("YYYY-MM-DD");
    },
    query() {
      return state.toDate();
    },
    equals(other) {
      return state.isSame(other.get());
    },
  };
};

export function createEnumPredicate<T extends readonly string[]>(...values: readonly [...T]) {
  const enumPredicate: Predicate<T[number]> = function (paramOrState) {
    if (paramOrState === "") {
      return undefined;
    }

    const state = values.find((v) => v.toUpperCase() === paramOrState.toUpperCase());

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
  const enumsPredicate: Predicate<T[number][]> = function (paramOrState) {
    if (paramOrState === "") {
      return undefined;
    }

    let state;
    if (typeof paramOrState === "string") {
      state = paramOrState.split(",");
    } else {
      state = paramOrState;
    }

    if (state.length === 0) {
      return undefined;
    }

    state = uniq(state);

    state = state.map((v) => {
      const state = states.find((s) => s.toUpperCase() === v.toUpperCase());

      if (state === undefined) {
        throw new FilteringReadError("", "Invalid value");
      }
      return state;
    });

    return {
      merge(other) {
        return enumsPredicate(union(state, other.get())) as StateWrapper<T[number][], T[number][]>;
      },
      without(predicate) {
        return enumsPredicate(difference(state, predicate.get()));
      },
      get() {
        return state;
      },
      param() {
        return state.join(",");
      },
      query() {
        return state;
      },
      equals(other) {
        const otherStates = other.get();
        return (
          state.length === otherStates.length &&
          intersection(state, otherStates).length === state.length
        );
      },
    };
  };
  return enumsPredicate;
}
