import { Router } from "meteor/iron:router";
import { useTranslation } from "react-i18next";
import { Template } from "meteor/templating";
import React from "react";

import "./styles.scss";

export type CategoryLabelProps = { category: string };

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
    <div className="tag tag-link category-tag">
      <a
        className={`js-category-label category-${category}`}
        data-category={category}
        data-bs-toggle="tooltip"
        data-bs-title={`${t("categories.show_courses", "Show all in {CATEGORY}", {
          CATEGORY: t(`category.${category}`),
        })}`}
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
        onClick={onClick}
        href={Router.url("home", {}, { query: { categories: category } })}
      >
        {t(`category.${category}`)}
      </a>
    </div>
  );
}

export type CourseCategoriesProps = {
  categories: string[];
  onClick?: (categorie: string) => Promise<void>;
  onMouseOver?: (categorie: string) => Promise<void>;
  onMouseOut?: (categorie: string) => Promise<void>;
};

export function CourseCategories({
  categories,
  onMouseOver,
  onMouseOut,
  onClick,
}: CourseCategoriesProps) {
  if (!categories?.length) {
    return null;
  }
  return (
    <div className="tag-group multiline course-categories">
      {categories.map((c) => (
        <CategoryLabelLinked
          key={c}
          category={c}
          onMouseOver={async () => {
            await onMouseOver?.(c);
          }}
          onMouseOut={async () => {
            await onMouseOut?.(c);
          }}
          onClick={async () => {
            await onClick?.(c);
          }}
        />
      ))}
    </div>
  );
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("CategoryLabel", () => CategoryLabel);
Template.registerHelper("CourseCategories", () => CourseCategories);
