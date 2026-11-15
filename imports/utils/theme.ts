import { Accounts } from "meteor/accounts-base";
import { getUserAsync } from "../api/users/users";

/**
 * @param theme "light" | "system" | "dark" | undefined
 */
export function setTheme(theme: string | undefined) {
  document.documentElement.classList.remove("theme-mode-dark");
  document.documentElement.classList.remove("theme-mode-system");

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
  Accounts.onLogin(async () => {
    const user = await getUserAsync();
    if (!user) {
      return;
    }

    setTheme(user.theme);
  });
}
