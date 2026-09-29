import { Router } from "meteor/iron:router";
import { useTranslation } from "react-i18next";
import React from "react";
import { Template } from "meteor/templating";
import { cx } from "/imports/utils/cx";

import "./styles.scss";

export function AdminPanelPage() {
  const { t } = useTranslation();

  const tasks = [
    {
      name: t("adminPanel.tasks.log", "Show log"),
      icon: "fa-regular fa-rectangle-list",
      route: "log",
    },
    {
      name: t("adminPanel.tasks.featuredOrganization", "Feature organization"),
      icon: "fa-solid fa-users",
      route: "featureOrganization",
    },
    {
      name: t("adminPanel.tasks.users", "Users"),
      icon: "fa-solid fa-user",
      route: "users",
    },
    {
      name: t("adminPanel.tasks.tenants", "Tenants"),
      icon: "fa-solid fa-sitemap",
      route: "tenants",
    },
    {
      name: t("adminPanel.tasks.venues", "Venues"),
      icon: "fa-solid fa-house",
      route: "venuesMap",
    },
    {
      name: t("adminPanel.tasks.stats", "Stats"),
      icon: "fa-solid fa-chart-line",
      route: "stats",
    },
    {
      name: t("adminPanel.tasks.testdata", "Testdata"),
      icon: "fa-solid fa-database",
      route: "testdata",
    },
  ];

  return (
    <div className="row">
      {tasks.map((task) => (
        <div key={task.route} className="col-12 col-sm-6 col-md-4 mb-4">
          <a href={Router.path(task.route)}>
            <div className="admin-task">
              <i className={cx(task.icon, "fa-2x")} />
              <h3>{task.name}</h3>
            </div>
          </a>
        </div>
      ))}
    </div>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("AdminPanelPage", () => AdminPanelPage);
