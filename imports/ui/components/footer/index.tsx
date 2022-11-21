import { Template } from 'meteor/templating';
import moment from 'moment';
import { Session } from 'meteor/session';
import { i18n } from '/imports/startup/both/i18next';
import React from 'react';
import { useTracker } from 'meteor/react-meteor-data';

import { useDetails } from '/imports/api/version/publications';
import { Regions } from '/imports/api/regions/regions';

import { getSiteName } from '/imports/utils/getSiteName';
import { PublicSettings } from '/imports/utils/PublicSettings';

import './styles.scss';

function Links() {
	const siteName = getSiteName(useTracker(() => Regions.currentRegion()));

	function links() {
		return PublicSettings.footerLinks.map((linkSpec) => ({
			link: linkSpec.link,
			text: linkSpec.key ? i18n(linkSpec.key, { SITENAME: siteName }) : linkSpec.text,
			title: linkSpec.title_key ? i18n(linkSpec.title_key, { SITENAME: siteName }) : '',
		}));
	}

	return (
		<>
			{links().map((l) => (
				<a className="footer-link" href={l.link} title={l.title}>
					{l.text}
				</a>
			))}
		</>
	);
}

function Footer() {
	const [isLoading, version] = useDetails();
	const locale = useTracker(() => Session.get('timeLocale')) || 'en';

	function versionName() {
		return version && version.basic + (version.branch !== 'master' ? ` ${version.branch}` : '');
	}
	function fullInfo() {
		return (
			version &&
			`${version.complete} on "${version.branch}" from ${version.commitDate} - restarted: ${moment(
				version.lastStart,
			)
				.locale(locale)
				.format('lll')}`
		);
	}

	function commit() {
		return version?.commitShort;
	}

	function deployed() {
		return version?.activation;
	}

	if (!isLoading()) {
		return (
			<footer className="footer">
				<Links />
				<span title={fullInfo()} className="footer-deployed-version">
					{versionName()} {commit()}
					<br />
					{i18n('footer.deployedAt', 'deployed:')} {moment(deployed()).locale(locale).format('L')}
				</span>
			</footer>
		);
	}
	return (
		<footer className="footer">
			<Links />
			<span className="footer-deployed-version">
				<span className="placeholder" style={{ minWidth: '100px' }}></span>
				<br />
				<span className="placeholder" style={{ minWidth: '100px' }}></span>
			</span>
		</footer>
	);
}

// for Blaze
// eslint-disable-next-line import/first
import './template.html';

Template.registerHelper(Footer.name, () => Footer);
