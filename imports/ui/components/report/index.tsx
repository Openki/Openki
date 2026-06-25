import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import * as Alert from "/imports/api/alerts/alert";
import * as emailMethods from "/imports/api/emails/methods";

import { ButtonCancel } from "../Buttons";

import "./styles.scss";

export function Report({ showGroupHint = false }: { showGroupHint?: boolean }) {
  const { t } = useTranslation();
  const [state, setState] = useState("");
  const [message, setMessage] = useState("");

  function reporting() {
    return state === "reporting";
  }
  function sending() {
    return state === "sending";
  }

  return (
    <>
      {sending() && t("report.sending", "Report is being sent…")}
      {reporting() ? (
        <div className="report p-3">
          <form
            className="needs-validation"
            noValidate
            onSubmit={async (event) => {
              event.preventDefault();

              setState("sending");
              try {
                await emailMethods.sendReport(
                  document.title,
                  window.location.href,
                  navigator.userAgent,
                  message,
                );
                Alert.success(
                  t(
                    "report.confirm",
                    "Your report was sent. A human will try to find an appropriate solution.",
                  ),
                );
              } catch (err) {
                Alert.serverError(err, t("report.notSent", "Your report could not be sent"));
              } finally {
                setState("");
              }
            }}
          >
            <div className="mb-3">
              <label className="form-label whitespace-pre-line" htmlFor="reportMessage">
                {t(
                  "report.textShort",
                  "Please tell us what is wrong.\n\nYour message will be sent to the technical team and the moderators of the site.",
                )}
                {showGroupHint && (
                  <>
                    {"\n"}
                    {t(
                      "report.groupHint",
                      "If your issue is organizational, please use the discussion form or contact the coordination-team of this group directly.",
                    )}
                  </>
                )}
              </label>
              <textarea
                className="form-control"
                id="reportMessage"
                autoFocus
                rows={5}
                placeholder={t("report.placeholder", "My hovercraft is full of eels.")}
                required
                minLength={6}
                onChange={(event) => setMessage(event.target.value)}
              ></textarea>
              <div className="invalid-feedback">
                {t(
                  "report.warning.tooShort",
                  "The report message is too short! Please write more than 5 characters.",
                )}
              </div>
            </div>
            <div className="d-flex gap-2 justify-content-end">
              <button type="submit" className="btn btn-save">
                <i className="fa-solid fa-paper-plane fa-fw" /> {t("report.report", "Send report")}
              </button>
              <ButtonCancel id="report-cancel" onClick={() => setState("")} />
            </div>
          </form>
        </div>
      ) : (
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            setState("reporting");
          }}
        >
          {t("report.open", "Report problem")}
        </button>
      )}
    </>
  );
}
