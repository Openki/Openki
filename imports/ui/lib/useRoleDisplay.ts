import { useTranslation } from "react-i18next";
import { Roles } from "../../api/roles/roles";

export function useRoleDisplay() {
  const { t } = useTranslation();

  return {
    roleShort(type: string) {
      if (!type) {
        return "";
      }
      return t(`roles.${type}.short`);
    },

    roleIcon(type: string) {
      if (!type) {
        return "";
      }

      return Roles.find((r) => r.type === type)?.icon || "";
    },
  };
}
