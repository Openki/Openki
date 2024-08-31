import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { Alerts as AlertsCollection } from "/imports/api/alerts/alerts";

import "./styles.scss";

function Alert({
  id,
  title,
  message,
  links,
  type,
  timeout,
}: {
  id: string;
  title: string | undefined;
  message: string;
  links?: { text: string; href: string }[] | undefined;
  type: string;
  timeout: number;
}) {
  const { t } = useTranslation();

  const updateSpacerHeight = () => {
    $(".alert-messages-spacer").height($(".alert-messages").height() || 0);
  };

  const remove = (alertId: string) => {
    const $alert = $(".alert-message");
    // get 'transition-duration' and convert to miliseconds for fadeOut
    const duration = Number.parseFloat($alert.css("transition-duration")) * 1000;
    $alert.fadeOut(duration, () => {
      updateSpacerHeight();
      AlertsCollection.remove({ _id: alertId });
    });
  };

  function contextualClass() {
    return type === "error" ? "danger" : type;
  }

  let timedRemove: number;

  useEffect(() => {
    updateSpacerHeight();
    $(".alert-message").toggleClass("is-faded-in");

    timedRemove = Meteor.setTimeout(() => remove(id), timeout);
  });

  return (
    <div
      className={`alert alert-${contextualClass()} alert-dismissible alert-message fs-4`}
      role="alert"
    >
      {title ? <h3 className="alert-heading">{title}</h3> : null}
      {message}
      {links ? (
        <>
          <hr className="border border-black" />
          {links.map((l) => (
            <>
              {" "}
              <a className="btn btn-primary" href={l.href}>
                {l.text}
              </a>
            </>
          ))}
        </>
      ) : null}
      <button
        type="button"
        className="btn-close"
        aria-label={t("message.close", "Close message")}
        onClick={() => {
          if (timedRemove) {
            Meteor.clearTimeout(timedRemove);
          }
          remove(id);
        }}
      ></button>
    </div>
  );
}

export function Alerts() {
  return (
    <>
      <div className="alert-messages container mt-2">
        {AlertsCollection.find()
          .fetch()
          .map((a) => (
            <Alert
              key={a._id}
              id={a._id}
              title={a.title}
              message={a.message}
              links={a.links}
              type={a.type}
              timeout={a.timeout}
            />
          ))}
      </div>
      <div className="alert-messages-spacer"></div>
    </>
  );
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("Alerts", () => Alerts);
