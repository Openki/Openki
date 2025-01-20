import React from "react";
import { Template } from "meteor/templating";
import { Session } from "meteor/session";
import { useTranslation } from "react-i18next";
import { Router } from "meteor/iron:router";
import { useUser } from "/imports/utils/react-meteor-data";

import { Report } from "/imports/ui/components/report";

import "./styles.scss";

function BackArrow() {
  const isRTL = Session.equals("textDirectionality", "rtl");
  const direction = isRTL ? "right" : "left";
  return <span className={`fa-solid fa-arrow-${direction} fa-fw`} aria-hidden="true"></span>;
}

export function NotFound() {
  const { t } = useTranslation();
  const currentUser = useUser();

  return (
    <div className="container text-center">
      <div className="page-component">
        {/* No line between flash and text, but inside the text.  */}
        <h1 style={{ whiteSpace: "nowrap" }}>
          <span className="fa-solid fa-bolt fa-fw text-warning" aria-hidden="true"></span>&nbsp;
          <span style={{ whiteSpace: "normal" }}>{t("notFound.title", "Page not found")}</span>
          &nbsp;<span className="fa-solid fa-bolt fa-fw text-warning" aria-hidden="true"></span>
        </h1>
        <h3>{t("notFound.explanation", "This page is not available. Maybe it never existed.")}</h3>
        {currentUser ? null : (
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
              <span className="fa-solid fa-house fa-fw" aria-hidden="true"></span>&nbsp;
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
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("NotFound", () => NotFound);
