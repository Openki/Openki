/** check contribution is older then a year */
export function checkContribution(contribution: Date | undefined) {
	return contribution && new Date().valueOf() - contribution.valueOf() < 1000 * 3600 * 24 * 365;
}

export default checkContribution;
