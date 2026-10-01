import { Tracker } from "meteor/tracker";

import { StateWrapper, Predicate } from "/imports/utils/predicates";

export class FilteringReadError extends Error {
  constructor(
    public name: string,
    message: string,
  ) {
    super(message);
  }
}

/**
 * A helper type to get the generic parameter.
 */
type GetPredicateT1<C extends Predicate<any>> =
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  C extends Predicate<infer T1, infer _T2> ? T1 : unknown;

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

  set<N extends keyof T>(name: N, paramOrState: string | GetPredicateT1<T[N]>) {
    try {
      if (!this._availablePredicates[name]) {
        throw new FilteringReadError("", `No predicate ${name as string}`);
      }
      const toSet = this._availablePredicates[name](paramOrState);

      this._predicates[name] = toSet as any;

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

  add<N extends keyof T>(name: N, paramOrState: string | GetPredicateT1<T[N]>) {
    try {
      if (!this._availablePredicates[name]) {
        throw new FilteringReadError("", `No predicate ${name as string}`);
      }
      const toAdd = this._availablePredicates[name](paramOrState);
      if (!toAdd) {
        return this; // Nothing to add leave as-is
      }

      const predicate = this._predicates[name];

      if (predicate) {
        this._predicates[name] = predicate.merge(toAdd) as any;
      } else {
        this._predicates[name] = toAdd as any;
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
          this.set(name, value);
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
    Object.keys(list).forEach((name) => this.set(name, list[name] as string));
    return this;
  }

  remove<N extends keyof T>(name: N, paramOrState: string | GetPredicateT1<T[N]>) {
    try {
      if (!this._availablePredicates[name]) {
        throw new FilteringReadError("", `No predicate ${name as string}`);
      }
      const toRemove = this._availablePredicates[name](paramOrState);

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
  toggle<N extends keyof T>(name: N, paramOrState: string | GetPredicateT1<T[N]>): Filtering<T>;

  toggle<N extends keyof T>(name: N, paramOrState?: string | GetPredicateT1<T[N]>) {
    if (!paramOrState) {
      // overload: toggle(name)
      if (this.get(name)) {
        this.disable(name);
      } else {
        this.enable(name);
      }
    }
    // overload: toggle(name, param)
    else if (this.get(name)?.includes(paramOrState)) {
      this.remove(name, paramOrState);
    } else {
      this.add(name, paramOrState);
    }

    return this;
  }

  enable(name: keyof T) {
    this.set(name, "1");
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

  /** Convert to a filter object that can be send to a server method or publisher */
  toQuery() {
    if (Tracker.active) {
      this._dep.depend();
    }
    const query: {
      [name in keyof T]+?: ReturnType<Extract<ReturnType<T[name]>, StateWrapper>["query"]>;
    } = {};
    Object.entries(this._predicates).forEach(([name, value]) => {
      query[name as keyof T] = value?.query();
    });
    return query;
  }
}
