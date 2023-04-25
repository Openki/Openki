export const Default = 'all';

/**
 * Use undefined instead of 'all' to mean "All regions".
 * This is needed until all instances where we deal with regions are patched.
 */
export function CleanedRegion(region: string) {
	return region === Default ? undefined : region;
}
