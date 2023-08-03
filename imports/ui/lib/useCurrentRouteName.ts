import { Router } from 'meteor/iron:router';
import { useTracker } from 'meteor/react-meteor-data';

export function useCurrentRouteName() {
	return useTracker(() => Router.current().route?.getName());
}
