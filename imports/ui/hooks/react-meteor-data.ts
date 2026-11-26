import { EJSON } from "meteor/ejson";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { Session } from "meteor/session";

// There is a useUser in meteor/react-meteor-accounts but it do not work as expected at the moment ...
export function useUser() {
  return useTracker(() => Meteor.user());
}

// There is a useUserId in meteor/react-meteor-accounts but it do not work as expected at the moment ...
export function useUserId() {
  return useTracker(() => Meteor.userId());
}

export function useSession<T extends keyof Session.SessionData>(key: T) {
  return useTracker(() => Session.get<T>(key));
}

export function useSessionEquals<
  K extends keyof Session.SessionData,
  V extends Parameters<(typeof Session)["equals"]>[1],
>(key: K, value: V) {
  return useTracker(() => Session.equals(key, value));
}

export function useMeteorStatus() {
  return useTracker(() => Meteor.status().status);
}

/**
 * Alternative to `useSubscribe()` that also tracks dependencies.
 *
 * This ensures that conditional subscriptions work as expected by
 * rerunning the tracker when the `name` or `args` change.
 */
export const useSubscribeWithDeps = (name?: string, ...args: any[]): (() => boolean) => {
  const isReady = useTracker(() => {
    if (!name) return true;
    return Meteor.subscribe(name, ...args).ready();
  }, [name, EJSON.stringify(args as any)]);

  return () => !isReady;
};
