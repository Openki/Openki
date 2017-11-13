/** Use null instead of 'all' to mean "All regions".
  * This is needed until all instances where we deal with regions are patched.
  */
export default function CleanedRegion(region) {
	return region === 'all' ? null : region;
}
