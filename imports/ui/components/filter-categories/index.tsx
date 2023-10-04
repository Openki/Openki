import { Template } from "meteor/templating";
import React from "react";
import { useTranslation } from "react-i18next";

import { Categories } from "/imports/api/categories/categories";

import { ReactSelect2 } from "../react-select2";
import "/imports/ui/components/courses/categories";

import "./styles.scss";

export function FilterCategories(props: {
  categories: string[] | undefined;
  onAdd: (category: string) => void;
  onRemove: (category: string) => void;
}) {
  const categories = Object.keys(Categories);

  const { t } = useTranslation();

  if (categories) {
    return (
      <ReactSelect2
        className="categories-select form-control"
        multiple={true}
        defaultValue={props.categories}
        placeholder={t("find.searchCategories.placeholder", "Choose categories")}
        noResults={t("find.filter-no-categories-found", "No categories found")}
        onSelect={props.onAdd}
        onUnselect={props.onRemove}
      >
        {categories.map((category) => (
          <React.Fragment key={category}>
            <option className="categories-select-option" value={category}>
              {t(`category.${category}`)}
            </option>
            {Categories[category].map((subcategory) => (
              <option
                key={subcategory}
                className="categories-select-sub-option"
                value={subcategory}
              >
                {t(`category.${subcategory}`)}
              </option>
            ))}
          </React.Fragment>
        ))}
      </ReactSelect2>
    );
  }
  return null;
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("FilterCategories", () => FilterCategories);
