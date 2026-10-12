import React, { useMemo } from "react";
import { components, OptionProps } from "react-select";
import { useTranslation } from "react-i18next";

import { Categories } from "/imports/api/categories/categories";

import { cx } from "/imports/utils/cx";

import { ReactSelect } from "/imports/ui/components/react-select";

import "../groups/categories";

import "./styles.scss";

export interface Props {
  categories: string[] | undefined;
  onChange: (categories: string[]) => void;
}

interface CategoryOption {
  value: string;
  label: string;
  isSubcategory?: boolean;
}

function CategoryOptionComponent(props: OptionProps<CategoryOption, true>) {
  return (
    <components.Option
      {...props}
      innerProps={{
        ...props.innerProps,
        className: cx(
          props.innerProps.className,
          props.data.isSubcategory && "ps-3 categories-select-sub-option",
        ),
      }}
    >
      {props.children}
      {props.isSelected && <i className="ms-1 fa-solid fa-check d-inline" />}
    </components.Option>
  );
}

export function FilterCategories({ categories, onChange }: Props) {
  const { t } = useTranslation();

  const allCategories = Object.keys(Categories);

  const options: CategoryOption[] = useMemo(
    () =>
      allCategories.flatMap((category) => [
        {
          value: category,
          label: t(`category.${category}`),
        },
        ...Categories[category].map((subcategory) => ({
          value: subcategory,
          label: t(`category.${subcategory}`),
          isSubcategory: true,
        })),
      ]),
    [allCategories, t],
  );

  if (!allCategories.length) {
    return null;
  }

  const value = options.filter((option) => categories?.includes(option.value));

  return (
    <ReactSelect
      isMulti
      value={value}
      options={options}
      placeholder={t("find.searchCategories.placeholder", "Choose categories")}
      noOptionsMessage={() => t("find.filter-no-categories-found", "No categories found")}
      components={{
        Option: CategoryOptionComponent,
      }}
      hideSelectedOptions={false}
      onChange={(newValue) => {
        onChange(newValue.map((o) => o.value));
      }}
    />
  );
}
