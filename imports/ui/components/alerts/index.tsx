import React, { useEffect, useRef, useState } from "react";
import { useTracker } from "meteor/react-meteor-data";
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
  const elementRef = useRef<HTMLDivElement>(null);
  const [timer, setTimer] = useState<number>();

  const remove = (alertId: string) => {
    if (!elementRef.current) {
      throw new Error("Unexpected falsy: elementRef.current");
    }
    const $alert = $(elementRef.current);
    // get 'transition-duration' and convert to miliseconds for fadeOut
    const duration = Number.parseFloat($alert.css("transition-duration")) * 1000;
    $alert.fadeOut(duration, () => {
      AlertsCollection.remove({ _id: alertId });
    });
  };

  function contextualClass() {
    return type === "error" ? "danger" : type;
  }

  useEffect(() => {
    if (timer) {
      Meteor.clearTimeout(timer);
    }
    setTimer(Meteor.setTimeout(() => remove(id), timeout));
  }, [id, timeout]);

  useEffect(() => {
    if (elementRef.current) {
      scrollIntoViewIfNotVisible(elementRef.current, ($(".navbar")?.height() || 0) + 7);
    }
  });

  let timeoutActionFocus: any = 0;
  return (
    <div
      ref={elementRef}
      className={`alert alert-${contextualClass()} alert-dismissible alert-message fs-4`}
      role="alert"
    >
      {!!title && <h3 className="alert-heading">{title}</h3>}
      {message}
      {!!actions && (
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
                    scrollIntoViewIfNotVisible(element, $(".navbar")?.height() || 0);

                    element.classList.remove("action-focus");
                    Meteor.setTimeout(() => {
                      element.classList.add("action-focus");
                      if (timeoutActionFocus) {
                        clearTimeout(timeoutActionFocus);
                      }
                      timeoutActionFocus = Meteor.setTimeout(() => {
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
      )}
      <button
        type="button"
        className="btn-close"
        aria-label={t("message.close", "Close message")}
        onClick={() => {
          if (timer) {
            Meteor.clearTimeout(timer);
          }
          remove(id);
        }}
      ></button>
    </div>
  );
}

export function Alerts() {
  const alerts = useTracker(() => AlertsCollection.find().fetch());

  return (
    <>
      <div className="container mt-2">
        {alerts.map((a) => (
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
    </>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("Alerts", () => Alerts);
