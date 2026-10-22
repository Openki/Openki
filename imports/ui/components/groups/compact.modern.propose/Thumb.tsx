import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { ScssVars } from "/imports/ui/lib/scss-vars";
import { useViewportSize } from "/imports/ui/hooks/useViewportSize";
import { ScrollBarHelper } from "/imports/startup/client/bootstrap";

export function Thumb() {
  const { t } = useTranslation();
  const viewport = useViewportSize();
  const isMobileScreen = viewport.width <= ScssVars.screenSM;
  const elementRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="card border-2 border-dashed h-100"
      ref={elementRef}
      style={isMobileScreen ? { width: 270, minWidth: 270 } : { width: 320, minWidth: 320 }}
    >
      <div className="card-body d-flex align-items-center">
        <form
          onSubmit={(event) => {
            event.preventDefault();

            location.hash = `show=propose`;
            new ScrollBarHelper().hide();
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
