import React, { useState } from "react";
import { Router } from "meteor/iron:router";

import { useTranslation } from "react-i18next";
import { useFindFilter } from "/imports/api/users/publications";

import { MetaTags } from "/imports/ui/components/MetaTags";

function FoundUsers({ userSearch }: { userSearch: string }) {
  const [isLoading, foundUsers] = useFindFilter(userSearch);
  if (isLoading()) {
    return null;
  }
  return (
    <div className="list-group">
      {foundUsers.map((user) => (
        <a
          key={user._id}
          href={Router.path("userprofile", user)}
          className="list-group-item list-group-item-action"
        >
          <i className="fa-solid fa-user fa-fw" /> {user.getDisplayName()}
        </a>
      ))}
    </div>
  );
}

export function AdminUsersPage() {
  const { t } = useTranslation();

  const [userSearch, setUserSearch] = useState("");

  return (
    <>
      <MetaTags title={t("admin.users.windowtitle", "Users")} />

      <h3>{t("users.title", "Users")}</h3>
      <div className="mb-3">
        <label className="form-label">{t("users.field.find.label", "Find a user")}</label>
        <div className="input-group">
          <span className="input-group-text">
            <i className="fa-solid fa-user fa-fw" />
          </span>
          <input
            className="form-control"
            placeholder={t("users.field.find.placeholder", "Type name of user")}
            type="search"
            onChange={(event) => {
              setUserSearch(event.currentTarget.value);
            }}
            value={userSearch}
          />
        </div>
      </div>
      {userSearch.length > 0 && <FoundUsers userSearch={userSearch} />}
    </>
  );
}
// for Blaze

import "./template.html";

Template.registerHelper("AdminUsersPage", () => AdminUsersPage);
