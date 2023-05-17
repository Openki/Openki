import { useTranslation } from 'react-i18next';
import { Template } from 'meteor/templating';
import React, { useEffect, useRef } from 'react';
import $ from 'jquery';

import { useDetails } from '/imports/api/groups/publications';

import { name } from '/imports/ui/lib/group-name-helpers';
import { useWindowSize } from '/imports/ui/lib/useWindowSize';

import select2 from 'select2';
import 'select2/dist/css/select2.min';
import 'select2-theme-bootstrap5/dist/select2-bootstrap.min';

import './styles.scss';

(select2 as any)();

function Option(props: { groupId: string }) {
	const { groupId } = props;
	const [isLoading, group] = useDetails(groupId);

	return (
		<option className="groups-select-option" value={groupId}>
			{isLoading() ? '...' : name(group)}
		</option>
	);
}

export function FilterGroups(data: {
	availableGroups: string[] | undefined;
	selectedGroups: string[] | undefined;
	onAdd: (group: string) => void;
	onRemove: (group: string) => void;
}) {
	const { t } = useTranslation();
	useWindowSize();

	const selectedGroups = data.selectedGroups;

	const selectRef = useRef(null);

	useEffect(() => {
		if (!selectRef.current) {
			return;
		}

		$(selectRef.current)
			.on('select2:select', (event) => {
				data.onAdd(event.params.data.id);
			})
			.on('select2:unselect', (event) => {
				data.onRemove(event.params.data.id);
			});
	});

	useEffect(() => {
		if (!selectRef.current) {
			return;
		}

		const $groupSelect = $(selectRef.current);

		if ($groupSelect.hasClass('select2-hidden-accessible')) {
			// Select2 has been initialized
			$groupSelect.select2('destroy');
		}
	});

	useEffect(() => {
		if (!selectRef.current) {
			return;
		}

		const $groupSelect = $(selectRef.current);

		$groupSelect.select2({
			theme: 'bootstrap',
			templateResult(data2: any) {
				// We only really care if there is an element to pull classes from
				if (!data2.element) {
					return data2.text;
				}

				const $element = $(data2.element);

				const $wrapper = $('<span></span>');
				$wrapper.addClass($element[0].className);

				$wrapper.text(data2.text);

				return $wrapper;
			},
			placeholder: t('filterGroups.placeholder', 'Choose group'),
			language: {
				noResults() {
					return t('filterGroups.no-groups-found', 'No groups found');
				},
			},
		});
	});

	if (!data.availableGroups) {
		return null;
	}

	return (
		<select
			ref={selectRef}
			className="groups-select form-control"
			multiple={true}
			defaultValue={selectedGroups}
		>
			{data.availableGroups.map((groupId) => (
				<Option key={groupId} groupId={groupId} />
			))}
		</select>
	);
}

// for Blaze
// eslint-disable-next-line import/first
import './template.html';

Template.registerHelper('FilterGroups', () => FilterGroups);
