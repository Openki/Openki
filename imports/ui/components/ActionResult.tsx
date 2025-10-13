import React, { JSX, ReactNode } from "react";

import { Report } from "/imports/ui/components/report";

export interface Props {
  type: "success" | "failed";
  icon?: JSX.Element | undefined;
  title: string;
  children?: ReactNode | undefined;
  actions?: (
    | {
        description?: string | undefined;
        href: string;
        text: string;
      }
    | JSX.Element
  )[];
  report?: boolean | undefined;
}

export function ActionResult({ type, icon, title, children, actions, report }: Props) {
  if (type === "success") {
    icon = icon || <i className="fa-solid fa-check fa-fw"></i>;

    report = report ?? false;
  } else if (type === "failed") {
    icon = icon || <i className="fa-solid fa-triangle-exclamation fa-fw"></i>;

    report = report ?? true;
  } else {
    throw new Error('Unexpected value for param "type".');
  }

  return (
    <div className="container mt-3">
      <div className={"alert alert-" + (type === "success" ? "success" : "danger")} role="alert">
        <h1 className="alert-heading d-flex align-items-center">
          <span className="flex-shrink-0 me-2">{icon}</span> {title}
        </h1>
        {!!children && <p className={"lead" + (!actions?.length ? " mb-0" : "")}>{children}</p>}
        {!!actions?.length && (
          <>
            <hr className="border border-black" />
            {actions.map((action, index) => (
              <p key={index} className={"lead" + (index + 1 === actions.length ? " mb-0" : "")}>
                {"href" in action ? (
                  <>
                    {action.description}{" "}
                    <a
                      className={"btn btn-lg btn-" + (type === "success" ? "success" : "secondary")}
                      href={action.href}
                    >
                      {action.text}
                    </a>
                  </>
                ) : (
                  action
                )}
              </p>
            ))}
          </>
        )}
      </div>

      {report && (
        <div className="mt-3 d-grid d-md-flex justify-content-center">
          <Report />
        </div>
      )}
    </div>
  );
}
