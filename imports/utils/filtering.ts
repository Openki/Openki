import { Tracker } from "meteor/tracker";
import { useEffect, useMemo } from "react";
import { useTracker } from "meteor/react-meteor-data";

import { ParamWrapper, Predicate } from "/imports/utils/predicates";

export class FilteringReadError {
  constructor(
    public name: string,
    public message: string,
  ) {}
}

/**
 * A helper type to get the generic parameter.
 */
type GetPredicateT1<C extends Predicate<any>> =
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  C extends Predicate<infer T1, infer _T2, infer _T3> ? T1 : unknown;
type GetPredicateT3<C extends Predicate<any>> =
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  C extends Predicate<infer _T1, infer _T2, infer T3> ? T3 : unknown;

export class Filtering<T extends Record<string, Predicate<any>>> {
  private _predicates: { [name in keyof T]+?: ReturnType<T[name]> } = {};

  private _dep = new Tracker.Dependency();

  constructor(private _availablePredicates: T) {}

  clear() {
    this._predicates = {};
    this._dep.changed();
    return this;
  }

  get<N extends keyof T>(name: N): GetPredicateT1<T[N]> | undefined {
    if (Tracker.active) {
      this._dep.depend();
    }
    return this._predicates[name]?.get();
  }

  add<N extends keyof T>(name: N, param: GetPredicateT3<T[N]> | string) {
    try {
      if (!this._availablePredicates[name]) {
        throw new FilteringReadError("", `No predicate ${name as string}`);
      }
      const toAdd = this._availablePredicates[name](param);
      if (!toAdd) {
        return this; // Filter construction failed, leave as-is
      }

      const predicate = this._predicates[name];

      if (predicate) {
        this._predicates[name] = predicate.merge(toAdd) as any;
      } else {
        this._predicates[name] = toAdd as any;
      }
      if (!this._predicates[name]) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete this._predicates[name];
      }
      this._dep.changed();
      return this;
    } catch (e) {
      if (e instanceof FilteringReadError) {
        e.name = name as string;
      }
      throw e;
    }
  }

  read(list: Partial<{ [name in keyof T]: string | undefined }>) {
    Object.entries(list).forEach(([name, value]) => {
      try {
        if (value !== undefined) {
          this.add(name, value as string);
        }
      } catch (e) {
        if (!(e instanceof FilteringReadError)) {
          throw e;
        }
      }
    });
    return this;
  }

  readAndValidate(list: Partial<{ [name in keyof T]: string }>) {
    Object.keys(list).forEach((name) => this.add(name, list[name] as string));
    return this;
  }

  remove<N extends keyof T>(name: N, param: GetPredicateT3<T[N]> | string) {
    try {
      if (!this._availablePredicates[name]) {
        throw new FilteringReadError("", `No predicate ${name as string}`);
      }
      const toRemove = this._availablePredicates[name](param);

      const predicate = this._predicates[name];
      if (predicate) {
        (this._predicates[name] as any) = predicate.without(toRemove as any);
      }
      if (!this._predicates[name]) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete this._predicates[name];
      }
      this._dep.changed();
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

  /** eg. for ids and enums */
  toggle<N extends keyof T>(name: N, param: GetPredicateT3<T[N]> | string): Filtering<T>;

  toggle<N extends keyof T>(name: N, param?: GetPredicateT3<T[N]> | string) {
    if (!param) {
      // overload: toggle(name)
      if (this.get(name)) {
        this.disable(name);
      } else {
        this.enable(name);
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

  enable(name: keyof T) {
    this.add(name, "1");
    return this;
  }

  disable(name: keyof T) {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete this._predicates[name];
    this._dep.changed();
    return this;
  }

  /** Convert to query params that can be used as param in a url. */
  toParams() {
    if (Tracker.active) {
      this._dep.depend();
    }
    const params: { [name in keyof T]+?: string } = {};
    Object.entries(this._predicates).forEach(([name, value]) => {
      params[name as keyof T] = value?.param();
    });
    return params;
  }

  /** Convert to a filter object that can be send to a server method oder publisher */
  toQuery() {
    if (Tracker.active) {
      this._dep.depend();
    }
    const query: {
      [name in keyof T]+?: ReturnType<Extract<ReturnType<T[name]>, ParamWrapper>["query"]>;
    } = {};
    Object.entries(this._predicates).forEach(([name, value]) => {
      query[name as keyof T] = value?.query();
    });
    return query;
  }
}

export function useFiltering<T extends Record<string, Predicate<any>>>(
  predicates: T,
  params: Partial<{ [name in keyof T]: string | undefined }>,
) {
  const filter = useMemo(() => new Filtering(predicates), [predicates]);

  useEffect(() => {
    filter.read(params);
  }, [filter, params]);

  return {
    add: <N extends keyof T>(name: N, param: GetPredicateT3<T[N]> | string) =>
      filter.add(name, param),
    remove: <N extends keyof T>(name: N, param: GetPredicateT3<T[N]> | string) =>
      filter.remove(name, param),
    toggle: <N extends keyof T>(name: N, param?: GetPredicateT3<T[N]> | string) => {
      if (param === undefined) {
        filter.toggle(name);
      } else {
        filter.toggle(name, param);
      }
    },
    enable: (name: keyof T) => {
      filter.enable(name);
    },
    disable: (name: keyof T) => {
      filter.disable(name);
    },
    asQuery: useTracker(() => filter.toQuery()),
    asParams: useTracker(() => filter.toParams()),
  };
}
