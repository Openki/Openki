import { ReactiveVar } from "meteor/reactive-var";
import { Session } from "meteor/session";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";

import { ScssVars } from "/imports/ui/lib/scss-vars";
import * as Viewport from "/imports/ui/lib/viewport";

import "./register-frame";
import "./forgot-pwd-frame";
import "./visitor-frame";
import "./login-frame";
import type { Props as LoginFrameProps } from "./login-frame";

import "./template.html";
import { isEmail } from "/imports/utils/email-tools";

const Template = TemplateAny as TemplateStaticTyped<
  "accountTasks",
  unknown,
  {
    accountTask: ReactiveVar<string>;
    transferUsername: string | false;
    transferPassword: string | false;
    transferMail: string | false;
  }
>;

const template = Template.accountTasks;

template.onCreated(function () {
  const instance = this;

  instance.accountTask = new ReactiveVar("login");
  instance.autorun(() => {
    if (Session.equals("pleaseLogin", true)) {
      instance.$(".js-account-tasks").modal("show");
    }
  });
});

template.helpers({
  activeAccountTask(task: string) {
    return Template.instance().accountTask.get() === task;
  },
  pleaseLogin() {
    return Session.get("pleaseLogin");
  },
  loginFrameAttr(): LoginFrameProps {
    const instance = Template.instance();

    return {
      username: instance.transferUsername || "",
      password: instance.transferPassword || "",
      onForgotPassword({ username }) {
        if (isEmail(username)) {
          instance.transferMail = username;
        }
        instance.accountTask.set("recoverPwd");
      },
      onVisitorOpen() {
        instance.accountTask.set("visitor");
      },
      onRegisterOpen({ username, password }) {
        let email;

        // Sometimes people register with their email address in the first field
        // Move entered username over to email field if it contains a @
        if (isEmail(username)) {
          email = username;
          // eslint-disable-next-line no-param-reassign
          username = "";
        }

        instance.transferUsername = username;
        instance.transferPassword = password;
        instance.transferMail = email || "";

        instance.accountTask.set("register");
      },
      onLogin() {
        if (Viewport.get().width <= ScssVars.gridFloatBreakpoint) {
          $("#bs-navbar-collapse").collapse("hide");
        }
        $(".js-account-tasks").modal("hide");
      },
    };
  },
});

template.events({
  "show.bs.modal .js-account-tasks"(_event, instance) {
    /* eslint-disable-next-line no-param-reassign */
    instance.transferUsername = false;
    /* eslint-disable-next-line no-param-reassign */
    instance.transferPassword = false;
    /* eslint-disable-next-line no-param-reassign */
    instance.transferMail = false;
  },

  "shown.bs.modal .js-account-tasks"(_event, instance) {
    instance.$("input").first().trigger("select");
  },

  "hide.bs.modal .js-account-tasks"(_event, instance) {
    instance.$("input").val("");
  },

  "hidden.bs.modal .js-account-tasks"(_event, instance) {
    instance.accountTask.set("login");
    Session.set("pleaseLogin", false);
  },
});
