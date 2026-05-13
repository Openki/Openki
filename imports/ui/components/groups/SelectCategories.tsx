import React from "react";
import { useTranslation } from "react-i18next";
import { uniq, difference } from "lodash-es";

import { Categories } from "/imports/api/categories/categories";

import { CategoryLabel } from "./categories";
import { FormCheck } from "/imports/ui/components/FormCheck";

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

  function handleChange(catKey: string, checked: boolean) {
    let selectedCategories = props.categories || [];
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
        {t("group.edit.categoriesOptional", "Categories (optional)")}
      </label>
      {availableCategories().map((category) => {
        return (
          <React.Fragment key={category}>
            <div className="mt-2">
              <FormCheck
                id={`groups-select-categories-${category}`}
                type="box"
                label={
                  <>
                    <CategoryLabel category={category} />
                    {hasSubcategories(category) && <i className="fa-solid fa-angle-down fa-fw" />}
                  </>
                }
                checked={isChecked(category)}
                onChange={(checked) => handleChange(category, checked)}
              />
            </div>
            {availableSubcategories(category).map((subcategory) => (
              <div className="ms-4" key={subcategory}>
                <FormCheck
                  id={`groups-select-subcategories-${subcategory}`}
                  type="box"
                  label={<CategoryLabel category={subcategory} />}
                  checked={isChecked(subcategory)}
                  onChange={(checked) => handleChange(subcategory, checked)}
                />
              </div>
            ))}
          </React.Fragment>
        );
      })}
    </>
  );
}
