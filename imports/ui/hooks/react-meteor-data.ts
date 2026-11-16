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

export function useSession(key: string) {
  return useTracker(() => Session.get(key));
}

export function useSessionEquals<T>(key: string, value: T) {
  return useTracker(() => Session.equals(key, value));
}

export function useMeteorStatus() {
  return useTracker(() => Meteor.status().status);
}
