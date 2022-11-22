import { useTracker } from 'meteor/react-meteor-data';

export function useSession(key: string) {
	return useTracker(() => Session.get(key));
}

export function useSessionEquals(key: string, value: any) {
	return useTracker(() => Session.equals(key, value));
}
