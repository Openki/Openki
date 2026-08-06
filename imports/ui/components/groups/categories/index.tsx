import { Router } from "meteor/iron:router";
import { useTranslation } from "react-i18next";
import React from "react";

import "./styles.scss";

export interface CategoryLabelProps {
  category: string;
}

export function CategoryLabel({ category }: CategoryLabelProps) {
  const { t } = useTranslation();
  return <div className="tag category-tag">{t(`category.${category}`)}</div>;
}

function CategoryLabelLinked({
  category,
  onMouseOver,
  onMouseOut,
  onClick,
}: {
  category: string;
  onClick?: (() => Promise<void>) | undefined;
  onMouseOver?: (() => Promise<void>) | undefined;
  onMouseOut?: (() => Promise<void>) | undefined;
}) {
  const { t } = useTranslation();
  return (
    <div className="tag tag-link category-tag fw-light">
      <a
        className={`category-${category}`}
        data-category={category}
        data-bs-title={`${t("categories.showGroups", "Show all in {CATEGORY}", {
          CATEGORY: t(`category.${category}`),
        })}`}
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
        onClick={onClick}
        href={Router.url("search", {}, { query: { categories: category } })}
      >
        {t(`category.${category}`)}
      </a>
    </div>
  );
}

export interface GroupCategoriesProps {
  categories: string[];
  onClick?: (category: string) => Promise<void>;
  onMouseOver?: (category: string) => Promise<void>;
  onMouseOut?: (category: string) => Promise<void>;
}

export function GroupCategories({
  categories,
  onMouseOver,
  onMouseOut,
  onClick,
}: GroupCategoriesProps) {
  if (!categories?.length) {
    return null;
  }
  return (
    <div className="group-categories">
      <div className="tag-group multiline">
        {categories.map((category) => (
          <CategoryLabelLinked
            key={category}
            category={category}
            onMouseOver={async () => await onMouseOver?.(category)}
            onMouseOut={async () => await onMouseOut?.(category)}
            onClick={async () => await onClick?.(category)}
          />
        ))}
      </div>
    </div>
  );
}
