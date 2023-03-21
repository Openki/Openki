import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';

// There is a useUser in meteor/react-meteor-accounts but it do not work as expected at the moment ...
export function useUser() {
	return useTracker(() => Meteor.user());
}

export function useSession(key: string) {
	return useTracker(() => Session.get(key));
}

export function useSessionEquals(key: string, value: any) {
	return useTracker(() => Session.equals(key, value));
}
