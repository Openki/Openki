import { Tracker } from "meteor/tracker";
import { ParamWrapper, Predicate } from "imports/utils/predicates";

export class FilteringReadError {
  // eslint-disable-next-line no-useless-constructor
  constructor(
    public name: string,
    public message: string,
  ) {}
}

/**
 * A helper type to get the generic parameter.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type GetPredicateT1<C extends Predicate<any>> = C extends Predicate<infer T1, infer _T2, infer _T3>
  ? T1
  : unknown;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type GetPredicateT3<C extends Predicate<any>> = C extends Predicate<infer _T1, infer _T2, infer T3>
  ? T3
  : unknown;

export class Filtering<T extends Record<string, Predicate<any>>> {
  private _predicates: { [name in keyof T]+?: ReturnType<T[name]> } = {};

  private _dep = new Tracker.Dependency();

  // eslint-disable-next-line no-useless-constructor
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

  remove(name: keyof T, param?: string) {
    try {
      if (!this._availablePredicates[name]) {
        throw new FilteringReadError("", `No predicate ${name as string}`);
      }
      const toRemove = this._availablePredicates[name](param as any);

      const predicate = this._predicates[name];
      if (predicate) {
        (this._predicates[name] as any) = predicate.without(toRemove as any);
      }
      if (!this._predicates[name]) {
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

  /** eg. for string and id */
  toggle(name: keyof T, param: string): Filtering<T>;

  toggle(name: keyof T, param?: string) {
    if (!param) {
      // overload: toggle(name)
      if (this.get(name)) {
        this.disable(name);
      } else {
        this.add(name, "1");
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
