import React, { ReactNode } from "react";
import { cx } from "/imports/utils/cx";

export function Confirm({
  variant = "danger",
  children,
}: {
  variant?: "danger" | "warning";
  children?: ReactNode;
}) {
  return (
    <div
      className={cx(
        "border border-5 p-3",
        variant === "warning" ? "border-warning" : "border-danger",
      )}
    >
      {children}
    </div>
  );
}

export function ConfirmText({ children }: { children?: ReactNode }) {
  return <p className="fs-5 whitespace-pre-line">{children}</p>;
}

export function ConfirmActions({ children }: { children?: ReactNode }) {
  return (
    <div className="d-flex justify-content-end flex-wrap gap-2 flex-column flex-sm-row">
      {children}
    </div>
  );
}
