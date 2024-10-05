import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { Alerts as AlertsCollection } from "/imports/api/alerts/alerts";

import "./styles.scss";

function Alert({
  _id,
  message,
  type,
  timeout,
}: {
  _id: string;
  message: string;
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
    $(".alert-message").addClass("is-faded-in");

    timedRemove = Meteor.setTimeout(() => remove(_id), timeout);
  });

  return (
    <div
      className={`alert alert-${contextualClass()} alert-dismissible alert-message`}
      role="alert"
    >
      {message}
      <button
        type="button"
        className="btn-close"
        aria-label={t("message.close", "Close message")}
        onClick={() => {
          if (timedRemove) {
            Meteor.clearTimeout(timedRemove);
          }
          remove(_id);
        }}
      ></button>
    </div>
  );
}

export function Alerts() {
  return (
    <>
      <div className="alert-messages container">
        {AlertsCollection.find()
          .fetch()
          .map((a) => (
            <Alert key={a._id} _id={a._id} message={a.message} type={a.type} timeout={a.timeout} />
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
