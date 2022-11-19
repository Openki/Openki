import { _ } from 'meteor/underscore';
import { i18n } from '/imports/startup/both/i18next';
import React, { useCallback, useState } from 'react';
import { Template } from 'meteor/templating';

import './styles.scss';

function SearchField(props: {
	search: string | undefined;
	onChange: (newValue: string) => void;
	onFocusOut?: () => void;
}) {
	const { onChange, onFocusOut } = props;
	const [value, setValue] = useState(props.search ?? '');

	// prevented unwanted input in the search
	const handleSearch = useCallback(
		_.debounce((newValue: string) => {
			setValue(newValue);
			onChange(newValue);
			// we don't updateURL() here, only after the field loses focus
		}, 200),
		[],
	);

	function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
		const newValue = e.target.value;
		setValue(newValue);
		handleSearch(newValue);
	}

	return (
		<div
			className="search-field"
			onChange={
				// Update the URI when the search-field was changed an loses focus

				() => onFocusOut?.()
			}
		>
			<div className="input-group input-group-lg">
				<input
					className="form-control search-input"
					type="text"
					id="find"
					value={value}
					placeholder={i18n('find.search_placeholder', 'Everything')}
					onChange={handleChange}
				/>
				<button
					type="button"
					className="btn btn-success"
					onClick={(event) => {
						event.preventDefault();
						onChange(value);
						onFocusOut?.();
					}}
				>
					{i18n('find.search_go', 'Go!')}
				</button>
			</div>
		</div>
	);
}

// for Blaze
// eslint-disable-next-line import/first
import './template.html';

Template.registerHelper(SearchField.name, () => SearchField);
