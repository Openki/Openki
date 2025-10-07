import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "/imports/startup/client/bootstrap";
import { Router } from "meteor/iron:router";
import { useSession, useSessionEquals } from "/imports/utils/react-meteor-data";

import { isEmail } from "/imports/utils/email-tools";
import { ScssVars } from "/imports/ui/lib/scss-vars";
import { useViewportSize } from "/imports/ui/lib/useViewportSize";

import { LoginFrame, Props as LoginFrameProps } from "./login-frame";
import { ForgotPwdFrame, Props as ForgotPwdFrameProps } from "./forgot-pwd-frame";
import { VistiorFrame, Props as VisitorFrameProps } from "./visitor-frame";
import { RegisterFrame, Props as RegisterFrameProps } from "./register-frame";

import "./styles.scss";

function Title({ activeTask }: { activeTask: string }) {
  const { t } = useTranslation();
  const pleaseLogin = useSessionEquals("pleaseLogin", true);

  switch (activeTask) {
    case "login":
      return pleaseLogin ? (
        <>
          <i className="fa-solid fa-circle-exclamation fa-fw" aria-hidden="true"></i>
          &nbsp;
          {t("Please.login", "Please log in or register")}
        </>
      ) : (
        <>
          <i className="fa-solid fa-right-to-bracket fa-fw" aria-hidden="true"></i>
          &nbsp;
          {t("login.login.title", "Log in")}
        </>
      );
    case "recoverPwd":
      return (
        <>
          <i className="fa-solid fa-unlock fa-fw" aria-hidden="true"></i>&nbsp;
          {t("login.recoverPwd.title", "Recover Password")}
        </>
      );
    case "visitor":
      return (
        <>
          <i className="fa-solid fa-user-plus fa-fw" aria-hidden="true"></i>&nbsp;
          {t("login.visitor.submit")}
        </>
      );
    case "register":
      return (
        <>
          <i className="fa-solid fa-user-plus fa-fw" aria-hidden="true"></i>&nbsp;
          {t("login.register.submit")}
        </>
      );

    default:
      throw new Error("Unexpected value for activeAccountTask");
  }
}

function Task({
  activeTask,
  onSwitch,
  onLogin,
  onResetPasswort,
}: {
  activeTask: string;
  onSwitch: (task: string) => void;
  onLogin: () => void;
  onResetPasswort: () => void;
}) {
  const [transferData, setTransferData] = useState({
    username: "",
    password: "",
    email: "",
    allowNews: false,
  });

  function loginFrameAttr(): LoginFrameProps {
    return {
      ...transferData,
      onForgotPassword({ username }) {
        if (isEmail(username)) {
          setTransferData({ ...transferData, email: username });
        }
        onSwitch("recoverPwd");
      },
      onVisitorOpen({ username }) {
        if (isEmail(username)) {
          setTransferData({ ...transferData, email: username });
        }
        onSwitch("visitor");
      },
      onRegisterOpen({ username, password }) {
        let email = "";

        // Sometimes people register with their email address in the first field
        // Move entered username over to email field if it contains a @
        if (isEmail(username)) {
          email = username;
          username = "";
        }

        setTransferData({ username, password, email, allowNews: false });

        onSwitch("register");
      },
      onLogin() {
        onLogin();
      },
    };
  }

  function forgotPwdFrameAttr(): ForgotPwdFrameProps {
    return {
      ...transferData,
      onForgotPwd() {
        Router.go("home", {}, { query: { action: "resetPasswortEmailSended" } });
        onResetPasswort();
      },
      onClose() {
        onSwitch("login");
      },
    };
  }

  function visitorFrameAttr(): VisitorFrameProps {
    return {
      ...transferData,
      onRegister() {
        onLogin();
      },
      onBack() {
        onSwitch("login");
      },
    };
  }

  function registerFrameAttr(): RegisterFrameProps {
    return {
      ...transferData,
      onRegister() {
        onLogin();
      },
      onBack() {
        onSwitch("login");
      },
    };
  }

  switch (activeTask) {
    case "login":
      return <LoginFrame {...loginFrameAttr()} />;
    case "recoverPwd":
      return <ForgotPwdFrame {...forgotPwdFrameAttr()} />;
    case "visitor":
      return <VistiorFrame {...visitorFrameAttr()} />;
    case "register":
      return <RegisterFrame {...registerFrameAttr()} />;

    default:
      throw new Error("Unexpected value for activeAccountTask");
  }
}

export function AccountTasks() {
  const pleaseLogin = useSessionEquals("pleaseLogin", true);
  const top = useSession("top");
  const viewport = useViewportSize();
  const [activeTask, setActiveTask] = useState("login");
  const [show, setShow] = useState(false);
  const elementModalRef = useRef<HTMLDivElement>(null);
  const elementModalDialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pleaseLogin && elementModalRef.current) {
      setShow(true);
      Modal.getOrCreateInstance(elementModalRef.current).show();

      if (top) {
        // this is needed in frames with the iframeHeightAdjust plugin eg. when /frame/program is used
        elementModalDialogRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }

    const hidden = () => {
      setActiveTask("login");
      Session.set("pleaseLogin", false);
      Session.set("visitorUserAllowed", false);
      Session.set("top", 0);
      setShow(false);
    };
    const shown = () => {
      setShow(true);
    };

    const element = elementModalRef.current;
    element?.addEventListener("hidden.bs.modal", hidden);
    element?.addEventListener("shown.bs.modal", shown);

    return () => {
      element?.removeEventListener("hidden.bs.modal", hidden);
      element?.removeEventListener("shown.bs.modal", shown);
    };
  }, [pleaseLogin]);

  return (
    <div
      className="modal account-tasks"
      id="accountTaskModal"
      tabIndex={-1}
      role="dialog"
      ref={elementModalRef}
    >
      <div
        className="modal-dialog modal-sm"
        role="document"
        style={
          top
            ? { top: top - 280 /* half modal height, todo: make this better */ + "px" }
            : undefined
        }
        ref={elementModalDialogRef}
      >
        {show && (
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">
                <Title activeTask={activeTask} />
              </h4>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <Task
                activeTask={activeTask}
                onSwitch={(task) => {
                  setActiveTask(task);
                }}
                onLogin={() => {
                  if (viewport.width <= ScssVars.gridFloatBreakpoint) {
                    $("#bs-navbar-collapse").collapse("hide");
                  }

                  if (elementModalRef.current) {
                    Modal.getOrCreateInstance(elementModalRef.current).hide();
                  }
                }}
                onResetPasswort={() => {
                  if (elementModalRef.current) {
                    Modal.getOrCreateInstance(elementModalRef.current).hide();
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// for Blaze
import "./template.html";

Template.registerHelper("AccountTasks", () => AccountTasks);
