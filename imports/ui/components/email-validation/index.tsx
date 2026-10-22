import moment from "moment";
import { Template } from "meteor/templating";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSessionEquals, useUser } from "/imports/ui/hooks/react-meteor-data";

import * as Alert from "/imports/api/alerts/alert";
import * as emailMethods from "/imports/api/emails/methods";
import { UserModel } from "/imports/api/users/users";

export interface Props {
  user: UserModel;
}

function EmailValidationModal({ user }: Props) {
  const { t } = useTranslation();
  const [isBusy, setIsBusy] = useState(false);
  const emailValidationModalClosed = useSessionEquals("emailValidationModalClosed", true);
  const elementRef = useRef(null);

  useEffect(() => {
    if (!emailValidationModalClosed && elementRef.current) {
      $(elementRef.current)
        .modal("show")
        .on("hide.bs.modal", function () {
          Session.set("emailValidationModalClosed", true);
        });
    }
  });

  async function handleClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    event.preventDefault();

    setIsBusy(true);
    try {
      await emailMethods.sendVerificationEmail();

      Alert.success(t("profile.sentVerificationMail", { MAIL: user?.emails[0].address }));
      if (elementRef.current) {
        $(elementRef.current).modal("hide");
      }
    } catch (err) {
      Alert.serverError(
        err,
        t("profile.sentVerificationMail.error", "Could not send verification e-mail"),
      );
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="modal" ref={elementRef} tabIndex={-1} role="dialog">
      <div className="modal-dialog modal-sm" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title">
              <i className="fa-solid fa-circle-exclamation fa-fw" />
              &nbsp;
              {t("validate.email.title", "Validate e-mail address")}
            </h4>
            <span className="btn-close" data-bs-dismiss="modal"></span>
          </div>
          <div className="modal-body">
            <span>
              <p>
                {t("validate.email.text.greeting", 'Hey "{NAME}"', {
                  NAME: user?.getDisplayName(),
                })}
              </p>
              <p>
                {t("validate.email.text.para1", "You have not validated your e-mail address yet.")}
              </p>
            </span>
            <div className="mb-3">
              <button className="btn btn-add form-control" disabled={isBusy} onClick={handleClick}>
                {isBusy ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin fa-fw" /> &nbsp;
                    {t("send.validation.submit.busy", "Sending…")}
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-paper-plane fa-fw" />
                    &nbsp;
                    {t("send.validation.email", "Send me a validation e-mail.")}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EmailValidation() {
  function useShowEmailValidation(user: UserModel | null): user is UserModel {
    return (
      !useSessionEquals("emailValidationModalClosed", true) &&
      !!user &&
      !user.hasVerifiedEmail() &&
      moment().subtract(7, "days").isAfter(user.createdAt)
    );
  }

  const user = useUser();

  if (!useShowEmailValidation(user)) {
    return null;
  }
  return <EmailValidationModal user={user} />;
}

// for Blaze

import "./template.html";

Template.registerHelper("EmailValidation", () => EmailValidation);
