import React from "react";
import { useTranslation } from "react-i18next";

import { Categories } from "/imports/api/categories/categories";

import { ReactSelect2 } from "../react-select2";
import "../groups/categories";

import "./styles.scss";

export interface Props {
  categories: string[] | undefined;
  onAdd: (category: string) => void;
  onRemove: (category: string) => void;
}

export function FilterCategories({ categories, onAdd, onRemove }: Props) {
  const allCategories = Object.keys(Categories);
  const { t } = useTranslation();

  if (!allCategories) {
    return null;
  }

  return (
    <ReactSelect2
      className="categories-select form-control"
      multiple
      value={categories}
      placeholder={t("find.searchCategories.placeholder", "Choose categories")}
      noResults={t("find.filter-no-categories-found", "No categories found")}
      onSelect={onAdd}
      onUnselect={onRemove}
    >
      {allCategories.map((category) => (
        <React.Fragment key={category}>
          <option value={category}>{t(`category.${category}`)}</option>
          {Categories[category].map((subcategory) => (
            <option key={subcategory} className="categories-select-sub-option" value={subcategory}>
              {t(`category.${subcategory}`)}
            </option>
          ))}
        </React.Fragment>
      ))}
    </ReactSelect2>
  );
}
