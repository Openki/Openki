import { Router } from "meteor/iron:router";
import { useTracker } from "meteor/react-meteor-data";

export function useCurrentRouteName() {
  return useTracker(() => Router.current().route?.getName());
}

export function useParams(): Record<string, string | undefined> {
  return useTracker(() => Router.current().params);
}

export function useSearchParams() {
  return useTracker(() => Router.current().params.query || {});
}

export function useHash(): string {
  return useTracker(() => Iron.Location.get().hash || "");
}
