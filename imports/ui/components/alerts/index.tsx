import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { Action, Alerts as AlertsCollection } from "/imports/api/alerts/alerts";

import "./styles.scss";

function scrollIntoView(target: HTMLElement, offestTop: number) {
  window.scrollTo(0, target.offsetTop - offestTop);
}

function scrollIntoViewIfNotVisible(target: HTMLElement, offestTop: number) {
  if (target.getBoundingClientRect().bottom > window.innerHeight) {
    target.scrollIntoView(false);
  }

  if (target.getBoundingClientRect().top < 0 + offestTop) {
    scrollIntoView(target, offestTop);
  }
}

function Alert({
  id,
  title,
  message,
  actions,
  type,
  timeout,
}: {
  id: string;
  title: string | undefined;
  message: string;
  actions?: Action[] | undefined;
  type: string;
  timeout: number;
}) {
  const { t } = useTranslation();

  const updateSpacerHeight = () => {
    const height = $(".alert-messages").height() || 0;

    if (height) {
      $(".alert-message").addClass("is-faded-in");
    } else {
      $(".alert-message").removeClass("is-faded-in");
    }

    $(".alert-messages-spacer").height(height);
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

    timedRemove = Meteor.setTimeout(() => remove(id), timeout);
  });

  let timeoutActionFocus: any = 0;
  return (
    <div
      className={`alert alert-${contextualClass()} alert-dismissible alert-message fs-4`}
      role="alert"
    >
      {title ? <h3 className="alert-heading">{title}</h3> : null}
      {message}
      {actions ? (
        <>
          <hr className="border border-black" />
          {actions.map((l) => (
            <React.Fragment key={l.href}>
              {" "}
              <a
                className="btn btn-success"
                href={l.href}
                onClick={(event) => {
                  event.preventDefault();

                  const elementId = l.href.split("#")[1];
                  const element = elementId && document.getElementById(elementId);
                  if (element) {
                    scrollIntoViewIfNotVisible(
                      element,
                      ($(".alert-messages")?.height() || 0) + ($(".navbar")?.height() || 0),
                    );

                    element.classList.remove("action-focus");
                    setTimeout(() => {
                      element.classList.add("action-focus");
                      if (timeoutActionFocus) {
                        clearTimeout(timeoutActionFocus);
                      }
                      timeoutActionFocus = setTimeout(() => {
                        element.classList.remove("action-focus");
                      }, 5000);
                    }, 0);
                  }
                }}
              >
                {l.text}
              </a>
            </React.Fragment>
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
              actions={a.actions}
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
