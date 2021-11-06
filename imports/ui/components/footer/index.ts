import { i18n } from '/imports/startup/both/i18next';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import moment from 'moment';

import Version from '/imports/api/version/version';
import { Regions } from '/imports/api/regions/regions';

import { getSiteName } from '/imports/utils/getSiteName';
import { PublicSettings } from '/imports/utils/PublicSettings';

import './template.html';
import './styles.scss';

const Template = TemplateAny as TemplateStaticTyped<'footer'>;

const template = Template.footer;

template.onCreated(function () {
	this.subscribe('version');
});

template.helpers({
	links() {
		const siteName = getSiteName(Regions.currentRegion());

		return PublicSettings.footerLinks.map((linkSpec) => ({
			link: linkSpec.link,
			text: linkSpec.key ? i18n(linkSpec.key, { SITENAME: siteName }) : linkSpec.text,
			title: linkSpec.title_key ? i18n(linkSpec.title_key, { SITENAME: siteName }) : '',
		}));
	},
	version() {
		const version = Version.findOne();
		return version && version.basic + (version.branch !== 'master' ? ` ${version.branch}` : '');
	},
	fullInfo() {
		const version = Version.findOne();
		return (
			version &&
			`${version.complete} on "${version.branch}" from ${version.commitDate} - restarted: ${moment(
				version.lastStart,
			).format('lll')}`
		);
	},
	commit() {
		const version = Version.findOne();
		return version?.commitShort;
	},
	deployed() {
		const version = Version.findOne();
		return version?.activation;
	},
	restart() {
		const version = Version.findOne();
		return version?.lastStart;
	},
});
