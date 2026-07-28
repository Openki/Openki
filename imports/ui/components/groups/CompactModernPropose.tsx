import { Router } from "meteor/iron:router";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScssVars } from "/imports/ui/lib/scss-vars";
import { useViewportSize } from "/imports/ui/lib/useViewportSize";

export interface Props {
  organization?: string | undefined;
  organizationTagEvents?:
    | ((organizationId: string) => {
        onMouseOver: () => Promise<void>;
        onMouseOut: () => Promise<void>;
        onClick: () => Promise<void>;
      })
    | undefined;
}

export function CompactPropose({ organization }: Props) {
  const { t } = useTranslation();
  const viewport = useViewportSize();
  const isMobileScreen = viewport.width <= ScssVars.screenSM;
  const elementRef = useRef<HTMLDivElement>(null);

  const [title, setTitle] = useState("");

  return (
    <div
      className="card me-1 border-dashed"
      ref={elementRef}
      style={isMobileScreen ? { width: 270, minWidth: 270 } : { width: 320, minWidth: 320 }}
    >
      <div className="card-body d-flex align-items-center">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            Router.go("proposeGroup", undefined, {
              query: organization ? { title, organization } : { title },
            });
          }}
        >
          <label className="px-2 lead">
            {t(
              "group.compact.propose.description",
              "Start your own group, whether as a mentor or participant. You decide what you want to learn.",
            )}
          </label>
          <div className="input-group input-group-lg p-2">
            <input
              type="text"
              className="form-control"
              placeholder={t("group.compact.propose.titlePlaceholder", "My proposal")}
              onChange={(event) => {
                setTitle(event.currentTarget.value);
              }}
            />
            <button className="btn btn-success" type="submit">
              {t("group.compact.propose.button", "Go!")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
