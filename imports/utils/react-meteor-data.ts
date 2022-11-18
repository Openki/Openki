import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';

export function useUserId() {
	return useTracker(() => Meteor.userId());
}

export function useUser() {
	return useTracker(() => Meteor.user());
}

export function useSession(key: string) {
	return useTracker(() => Session.get(key));
}

export function useSessionEquals(key: string, value: any) {
	return useTracker(() => Session.equals(key, value));
}
