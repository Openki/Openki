import { useTranslation } from 'react-i18next';
import { Template } from 'meteor/templating';
import React from 'react';

import './styles.scss';

export type Data = {
	courseId: string;
	regionId: string;
	categories: string[];
	title: string;
	image: string;
};

export function InternalIndicator() {
	const { t } = useTranslation();
	return (
		<span
			className="internal-indicator"
			data-bs-toggle="tooltip"
			data-bs-title={t('_label.internal')}
		></span>
	);
}

// for Blaze
// eslint-disable-next-line import/first
import './template.html';

Template.registerHelper(InternalIndicator.name, () => InternalIndicator);
