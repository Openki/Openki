import React, { ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import uniq from "lodash/uniq";
import difference from "lodash/difference";

import { Categories } from "/imports/api/categories/categories";

import { CategoryLabel } from "/imports/ui/components/courses/categories";

export interface Props {
  onChange: (selectedCategories: string[]) => void;
  categories: string[];
}

export function SelectCategories(props: Props) {
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

  function handleChange(a: ChangeEvent<HTMLInputElement>) {
    const catKey = a.target.name;
    let selectedCategories = props.categories || [];
    const checked = a.target.checked;
    if (checked) {
      selectedCategories.push(catKey);
      selectedCategories = uniq(selectedCategories);
    } else {
      selectedCategories = selectedCategories.filter((c) => c !== catKey);

      if (Categories[catKey]) {
        // Remove all the subcategories as well
        selectedCategories = difference(selectedCategories, Categories[catKey]);
      }
    }

    props.onChange(selectedCategories);
  }

  return (
    <>
      <label className="form-label mb-0">
        {t("course.edit.edit_categories", "Edit Categories")}
      </label>
      {availableCategories().map((category) => {
        return (
          <React.Fragment key={category}>
            <div className="form-check mt-2">
              <input
                className="form-check-input"
                name={category}
                type="checkbox"
                value="1"
                id={`editCategory${category}`}
                checked={isChecked(category)}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor={`editCategory${category}`}>
                <CategoryLabel category={category} />
                {hasSubcategories(category) && <i className="fa-solid fa-angle-down fa-fw"></i>}
              </label>
            </div>
            {availableSubcategories(category).map((subcategory) => {
              return (
                <div className="form-check ms-4" key={subcategory}>
                  <input
                    className="form-check-input"
                    name={subcategory}
                    type="checkbox"
                    value="1"
                    id={`editSubCategory${subcategory}`}
                    checked={isChecked(subcategory)}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor={`editSubCategory${subcategory}`}>
                    <CategoryLabel category={subcategory} />
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
