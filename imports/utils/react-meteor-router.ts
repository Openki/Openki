import { Router } from "meteor/iron:router";
import { useTracker } from "meteor/react-meteor-data";

export function useParams(): Record<string, string | undefined> {
  return useTracker(() => Router.current().params);
}

export function useSearchParams() {
  return useTracker(() => Router.current().params.query);
}
