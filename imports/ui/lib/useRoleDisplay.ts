import { useTranslation } from "react-i18next";
import { RoleEntity } from "/imports/api/regions/regions";

export function useRoleDisplay() {
  const { t } = useTranslation();

  return {
    roleShort(type: RoleEntity["type"]) {
      if (!type) {
        return "";
      }
      return t(`roles:${type}.short`);
    },
  };
}
