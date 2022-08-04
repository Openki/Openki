import { Router } from 'meteor/iron:router';

// Extends the route function to support async await in onRun

export function route<
	D = never,
	P extends Record<string, string> = Record<string, never>,
	Q extends Record<string, string> | unknown = unknown,
	T extends Record<string, unknown> = Record<string, never>,
>(
	pathOrRouteName: string,
	options: Router.RouteOptions<D, P, Q, T> & { onRun?: () => Promise<unknown> },
) {
	if (!options.onRun) {
		Router.route<D, P, Q, T>(pathOrRouteName, options);
		return;
	}

	const onRunOption = options.onRun;
	// eslint-disable-next-line no-param-reassign
	delete options.onRun;

	const waitOn = options.waitOn;
	// eslint-disable-next-line no-param-reassign
	delete options.waitOn;

	const onRunAwaited = new ReactiveVar<boolean>(false);
	const newOptions = {
		onRun() {
			onRunOption?.().then(() => {
				onRunAwaited.set(true);
			});
			(this as any).next();
		},
		waitOn: waitOn
			? function () {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					const waitOnResult = waitOn.call(this);

					if (Array.isArray(waitOnResult)) {
						return [
							...waitOnResult,
							function () {
								return onRunAwaited.get();
							},
						];
					}

					return [
						waitOnResult,
						function () {
							return onRunAwaited.get();
						},
					];
			  }
			: function () {
					return function () {
						return onRunAwaited.get();
					};
			  },
		...options,
	} as Router.RouteOptions<D, P, Q, T>;

	Router.route<D, P, Q, T>(pathOrRouteName, newOptions);
}

export default route;
