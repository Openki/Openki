import React, { JSX, ReactNode, useRef } from "react";
import { useTranslation } from "react-i18next";
import scrollIntoView from "scroll-into-view-if-needed";

import { MeteorAsync } from "/imports/utils/promisify";
import { cx } from "/imports/utils/cx";

import { Report } from "/imports/ui/components/report";

type Action =
  | {
      description?: string | undefined;
      href: string;
      text: string;
    }
  | {
      description?: string | undefined;
      button: JSX.Element;
    }
  | JSX.Element;

export interface Props {
  type: "success" | "failed";
  dismissible?: boolean | undefined;
  icon?: ReactNode | undefined;
  title: string;
  children?: ReactNode | undefined;
  actions?: (Action | undefined)[];
  report?: boolean | undefined;
}

export function ActionResult({
  type,
  dismissible,
  icon,
  title,
  children,
  actions: actionsWithUndefined = [],
  report,
}: Props) {
  const { t } = useTranslation();

  if (type === "success") {
    icon = icon || "fa-solid fa-check";

    report = report ?? false;
  } else if (type === "failed") {
    icon = icon || "fa-solid fa-triangle-exclamation";

    report = report ?? true;
  } else {
    throw new Error(`Unexpected value for param "type": ${type}`);
  }

  if (typeof icon === "string" && icon.startsWith("fa-")) {
    icon = <i className={cx(icon, "fa-fw")} />;
  }

  const actions = actionsWithUndefined.filter((a) => a) as Action[];

  // display actions stacked if there is a description or complex element
  const stacked = actions.find((a) => "description" in a || !("href" in a || "button" in a));

  const timeoutActionFocusRef = useRef(0);
  async function handleActionClick(
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    href: string,
  ) {
    const parts = href.split("#");

    if (parts[0].length > 1) {
      await MeteorAsync.setTimeout(400);
    } else {
      event.preventDefault();
    }

    const elementId = parts[1];
    const element = elementId && document.getElementById(elementId);
    if (element) {
      scrollIntoView(element, {
        block: "center",
        inline: "center",
        behavior: "smooth",
        scrollMode: "if-needed",
      });

      element.classList.remove("action-focus");
      await MeteorAsync.defer();
      element.classList.add("action-focus");
      element.tabIndex = 0;
      element.focus();
      if (timeoutActionFocusRef.current) {
        clearTimeout(timeoutActionFocusRef.current);
      }

      timeoutActionFocusRef.current = Meteor.setTimeout(() => {
        element.classList.remove("action-focus");
      }, 5000);
    }
  }

  return (
    <div className="container collapse show" id="action-result">
      <div className="pt-3 pb-5">
        <div
          className={cx(
            `mb-0 alert alert-${type === "success" ? "success" : "danger"}`,
            dismissible && "alert-dismissible",
          )}
          role="alert"
        >
          {!!dismissible && (
            <button
              id="action-result-close"
              type="button"
              className="btn-close"
              aria-label={t("_button.close")}
              data-bs-toggle="collapse"
              data-bs-target="#action-result"
              aria-expanded="true"
              aria-controls="action-result"
            />
          )}

          <h1 className="alert-heading d-flex align-items-center">
            <span className="flex-shrink-0 me-2">{icon}</span> {title}
          </h1>
          {!!children && <p className={cx("fs-4", !actions?.length && "mb-0")}>{children}</p>}
          {!!actions?.length && (
            <>
              <hr className="border border-black" />
              <div className={cx("d-flex gap-3", stacked ? "flex-column" : "flex-row flex-wrap")}>
                {actions.map((action, index) => (
                  <div key={index} className="fs-4">
                    {"description" in action && <>{action.description} </>}
                    {"href" in action ? (
                      <a
                        className={
                          "btn btn-lg btn-" + (type === "success" ? "success" : "secondary")
                        }
                        href={action.href}
                        onClick={(event) => handleActionClick(event, action.href)}
                      >
                        {action.text}
                      </a>
                    ) : "button" in action ? (
                      action.button
                    ) : (
                      action
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        {report && (
          <div className="mt-3 d-grid d-md-flex justify-content-center">
            <Report />
          </div>
        )}
      </div>
    </div>
  );
}
