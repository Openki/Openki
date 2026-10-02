import React from "react";
import { useTranslation } from "react-i18next";
import { routerAutoscroll } from "../../lib/router-autoscroll";
import * as Alert from "/imports/api/alerts/alert";
import * as usersMethods from "/imports/api/users/methods";
import { useUser } from "/imports/ui/hooks/react-meteor-data";
import * as Theme from "/imports/utils/theme";

export function Appearance() {
  const { t } = useTranslation();
  const user = useUser();

  if (!user) {
    return null;
  }

  async function handleThemeChange(event: React.ChangeEvent<HTMLSelectElement>) {
    routerAutoscroll.cancelNext();

    try {
      const theme = event.currentTarget.value;
      await usersMethods.updateTheme(theme);
      Theme.setTheme(theme);
      Alert.success(t("profile.updated", "Updated profile"));
    } catch (err) {
      Alert.serverError(
        err,
        t("profile.appearance.theme.changeTheme.error", "Failed to change theme"),
      );
    }
  }

  return (
    <>
      <div className="page-component page-component-seperated">
        <h3>{t("profile.appearance.title", "Appearance")}</h3>

        <div className="mb-3">
          <select className="form-select w-auto" value={user.theme} onChange={handleThemeChange}>
            <option value="light">{t("profile.apperance.theme.light", "Light theme")}</option>
            <option value="system">
              {t("profile.apperance.theme.system", "Sync theme with system")}
            </option>
            <option value="dark">{t("profile.apperance.theme.dark", "Dark theme")}</option>
          </select>
        </div>
      </div>
    </>
  );
}
