import React, { ChangeEvent } from 'react';
import { _ } from 'meteor/underscore';
import { useTranslation } from 'react-i18next';

import { Categories } from '/imports/api/categories/categories';

import { CategoryLabel } from '/imports/ui/components/courses/categories';

export type Props = {
	onChange: (selectedCategories: string[]) => void;
	categories: string[];
};

export function EditCategories(props: Props) {
	const { t } = useTranslation();

	function availableCategories() {
		return Object.keys(Categories);
	}
	function hasSubcategories(category: string) {
		return Categories[category].length > 0;
	}
	function availableSubcategories(category: string) {
		// Hide if parent categories not selected
		const selectedCategories = props.categories;
		if (!selectedCategories?.includes(category)) {
			return [];
		}

		return Categories[category];
	}
	function isChecked(self: string) {
		const selectedCategories = props.categories;
		return selectedCategories?.includes(self);
	}
	function isChecked2(self: string) {
		const selectedCategories = props.categories;
		return selectedCategories?.includes(self) ? 'checkbox-checked' : '';
	}

	function onChange(a: ChangeEvent<HTMLInputElement>) {
		const catKey = a.target.name;
		let selectedCategories = props.categories || [];
		const checked = a.target.checked;
		if (checked) {
			selectedCategories.push(catKey);
			selectedCategories = [...new Set(selectedCategories)]; // make unique
		} else {
			selectedCategories = selectedCategories.filter((c) => c !== catKey);

			if (Categories[catKey]) {
				// Remove all the subcategories as well
				selectedCategories = _.difference(selectedCategories, Categories[catKey]);
			}
		}

		props.onChange(selectedCategories);
	}

	return (
		<>
			<label className="form-label mb-0">
				{t('course.edit.edit_categories', 'Edit Categories')}
			</label>
			{availableCategories().map((self) => {
				return (
					<React.Fragment key={self}>
						<div className="form-check mt-2">
							<input
								className={`form-check-input js-category-checkbox cat_${self}`}
								name={self}
								type="checkbox"
								value="1"
								id={`courseEditCategory${self}`}
								checked={isChecked(self)}
								onChange={onChange}
							/>
							<label
								className={`form-check-label ${isChecked2(self)}`}
								htmlFor={`courseEditCategory${self}`}
							>
								<CategoryLabel category={self} />
								{hasSubcategories(self) ? (
									<i className={`fa-solid fa-angle-down fa-fw ${isChecked2(self)}`}></i>
								) : null}
							</label>
						</div>
						{availableSubcategories(self).map((self2) => {
							return (
								<div className="form-check ms-4" key={self2}>
									<input
										className={`form-check-input js-category-checkbox cat_${self2}`}
										name={self2}
										type="checkbox"
										value="1"
										id={`courseEditSubCategory${self2}`}
										checked={isChecked(self2)}
										onChange={onChange}
									/>
									<label
										className={`form-check-label ${isChecked2}`}
										htmlFor={`courseEditSubCategory${self2}`}
									>
										<CategoryLabel category={self2} />
									</label>
								</div>
							);
						})}
					</React.Fragment>
				);
			})}
		</>
	);
}

// for Blaze
// eslint-disable-next-line import/first
import './template.html';

Template.registerHelper('EditCategories', () => EditCategories);
