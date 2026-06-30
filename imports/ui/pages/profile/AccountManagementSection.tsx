import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, ButtonCancel } from "../../components/Buttons";
import { DeleteConfirm } from "../../components/DeleteConfirm";
import * as Alert from "/imports/api/alerts/alert";
import * as usersMethods from "/imports/api/users/methods";
import { AccountsAsync } from "/imports/utils/promisify";
import { useUser } from "/imports/utils/react-meteor-data";
import { cx } from "/imports/utils/cx";

function EyeToggle({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <span className="input-group-text p-0">
      <button type="button" className="btn btn-outline-secondary text-dark" onClick={onToggle}>
        <i className={cx("fa-fw fa-solid", show ? "fa-eye-slash" : "fa-eye")} />
      </button>
    </span>
  );
}

export function AccountManagementSection() {
  const { t } = useTranslation();
  const [changingPassword, setChangingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const user = useUser();

  const [isBusy, setIsBusy] = useState(false);

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showNewPasswordConfirm, setShowNewPasswordConfirm] = useState(false);

  function isVisitor() {
    return user?.hasPrivilige("visitor");
  }

  function deleteConfirmAttr() {
    return {
      confirmText: t(
        "profile.reallydelete",
        "Please confirm that you would like to delete your profile. This cannot be undone, you will have to create a new account if you want to use this site again.",
      ),
      confirmButton: t("profile.delete.confirm.button", "Delete my user and all its profile"),
      onRemove: async () => {
        await usersMethods.selfRemove();

        Alert.success(t("profile.deleted", "Your account has been deleted"));
      },
      busyButton: t("profile.delete.confirm.button.busy", "Deleting profile…"),
      deleteButtonLabel: t("profile.delete.button", "Delete my Account"),
    };
  }

  async function handleChangePassword(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const old = oldPassword;
    const pass = newPassword;
    if (pass !== "") {
      if (pass !== newPasswordConfirm) {
        Alert.warning(t("profile.passwordMismatch", "Sorry, your new passwords don't match"));
        return;
      }
      const minLength = 5; // We've got _some_ standards
      if (pass.length < minLength) {
        Alert.warning(t("profile.passwordShort", "Your desired password is too short. Sorry."));
        return;
      }
      setIsBusy(true);
      try {
        await AccountsAsync.changePassword(old, pass);

        Alert.success(t("profile.passwordChangedSuccess", "You have changed your password."));
        setChangingPassword(false);
      } catch (err) {
        Alert.serverError(err, t("profile.passwordChangeError", "Could not change your password"));
      } finally {
        setIsBusy(false);
      }
    }
  }

  return (
    <div className="page-component page-component-seperated">
      <h3>{t("profile.accountManagement", "Account Management")}</h3>

      {!isVisitor() && (
        <div className="mb-3">
          {!changingPassword ? (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setChangingPassword(true)}
            >
              {t("profile.changePass", "Change my password")}
            </button>
          ) : (
            <div className="border border-success text-primary p-3">
              <form onSubmit={handleChangePassword}>
                <div className="row mb-2">
                  <label htmlFor="oldpassword" className="col-sm-4 col-form-label text-end">
                    {t("profile.input.oldPassword", "Your current password")}
                  </label>
                  <div className="col-sm-8">
                    <div className="input-group">
                      <input
                        type={showOldPassword ? "text" : "password"}
                        className="form-control"
                        id="oldpassword"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.currentTarget.value)}
                      />
                      <EyeToggle
                        show={showOldPassword}
                        onToggle={() => setShowOldPassword((v) => !v)}
                      />
                    </div>
                  </div>
                </div>
                <div className="row mb-2">
                  <label htmlFor="newpassword" className="col-sm-4 col-form-label text-end">
                    {t("profile.input.newPassword", "New password")}
                  </label>
                  <div className="col-sm-8">
                    <div className="input-group">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        className="form-control"
                        id="newpassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.currentTarget.value)}
                      />
                      <EyeToggle
                        show={showNewPassword}
                        onToggle={() => setShowNewPassword((v) => !v)}
                      />
                    </div>
                  </div>
                </div>
                <div className="row mb-2">
                  <label htmlFor="newpassword_confirm" className="col-sm-4 col-form-label text-end">
                    {t("profile.input.repeatPassword", "Repeat new password")}
                  </label>
                  <div className="col-sm-8">
                    <div className="input-group">
                      <input
                        type={showNewPasswordConfirm ? "text" : "password"}
                        className="form-control"
                        id="newpassword_confirm"
                        value={newPasswordConfirm}
                        onChange={(e) => setNewPasswordConfirm(e.currentTarget.value)}
                      />
                      <EyeToggle
                        show={showNewPasswordConfirm}
                        onToggle={() => setShowNewPasswordConfirm((v) => !v)}
                      />
                    </div>
                  </div>
                </div>
                <div className="d-flex gap-2 justify-content-end">
                  <Button
                    id="profile-accountManagement-changingPassword-save"
                    submit
                    className="btn-cancel"
                    isBusy={isBusy}
                    busyText={t("_button.saving", "Saving…")}
                  >
                    {t("_button.save")}
                  </Button>
                  <ButtonCancel
                    id="profile-accountManagement-changingPassword-cancel"
                    onClick={() => setChangingPassword(false)}
                    disabled={isBusy}
                  />
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      <span>
        <DeleteConfirm {...deleteConfirmAttr()} />
      </span>
    </div>
  );
}
