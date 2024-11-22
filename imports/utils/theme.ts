import { Accounts } from "meteor/accounts-base";
import { Meteor } from "meteor/meteor";

export function setTheme(theme: "light" | "system" | "dark" | undefined) {
  document.documentElement.classList.remove("theme-mode-dark");
  document.documentElement.classList.remove("theme-mode-system");

  // eslint-disable-next-line default-case
  switch (theme) {
    case "dark":
      document.documentElement.classList.add("theme-mode-dark");
      break;
    case "system":
      document.documentElement.classList.add("theme-mode-system");
      break;
  }
}

export function init() {
  Accounts.onLogin(() => {
    const user = Meteor.user();
    if (!user) {
      return;
    }

    setTheme(user.theme);
  });
}
