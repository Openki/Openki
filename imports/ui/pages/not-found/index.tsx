import React from "react";
import { Template } from "meteor/templating";
import { Session } from "meteor/session";
import { useTranslation } from "react-i18next";
import { Router } from "meteor/iron:router";
import { useUserId } from "/imports/ui/hooks/react-meteor-data";

import { Report } from "/imports/ui/components/report";

import "./styles.scss";

function BackArrow() {
  const isRTL = Session.equals("textDirectionality", "rtl");
  const direction = isRTL ? "right" : "left";
  return <span className={`fa-solid fa-arrow-${direction} fa-fw`} />;
}

export function NotFound() {
  const { t } = useTranslation();
  const loggedIn = !!useUserId();

  return (
    <div className="container text-center">
      <div className="page-component">
        {/* No line between flash and text, but inside the text.  */}
        <h1 style={{ whiteSpace: "nowrap" }}>
          <i className="fa-solid fa-bolt fa-fw text-warning" />
          &nbsp;
          <span style={{ whiteSpace: "normal" }}>{t("notFound.title", "Page not found")}</span>
          &nbsp;
          <i className="fa-solid fa-bolt fa-fw text-warning" />
        </h1>
        <h3>{t("notFound.explanation", "This page is not available. Maybe it never existed.")}</h3>
        {!loggedIn && (
          <>
            <h4 className="mt-5">{t("notFound.login", "If it's private content, try:")}</h4>
            <button
              className="btn btn-success"
              onClick={() => {
                Session.set("pleaseLogin", true);
              }}
            >
              {t("login.unlogged", "Log in")}
            </button>
            <br />
            <br />
          </>
        )}
      </div>
      <div className="page-component page-component-seperated">
        <ul className="list-inline fs-5">
          <li className="list-inline-item">
            <a
              href="#"
              onClick={() => {
                window.history.back();
              }}
            >
              <BackArrow />
              &nbsp;
              {t("notFound.goBack", "Go back")}
            </a>
          </li>
          <li className="list-inline-item">
            <a href={Router.path("home")}>
              <i className="fa-solid fa-house fa-fw" />
              &nbsp;
              {t("notFound.visitStartPage", "Go to the start page")}
            </a>
          </li>
        </ul>
      </div>
      <div className="page-not-found-report mx-auto">
        <Report />
      </div>
    </div>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("NotFound", () => NotFound);
