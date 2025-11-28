import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSession } from "/imports/utils/react-meteor-data";

import { LanguageEntity, Languages } from "/imports/api/languages/languages";

import { routerAutoscroll } from "/imports/ui/lib/router-autoscroll";

import { PublicSettings } from "/imports/utils/PublicSettings";
import { MarkedName } from "/imports/utils/marked-name";
import { getLocalizedValue } from "/imports/utils/getLocalizedValue";

import "./styles.scss";

export interface Props {
  inNavbar?: boolean | undefined;
  onSelect?: (() => void) | undefined;
  onClose?: (() => void) | undefined;
}

export function Selection(props: Props) {
  const { t } = useTranslation();
  const locale = useSession("locale");
  const [search, setSearch] = useState("");
  const [searchHasFocus, setSearchHasFocus] = useState(true);
  const searchElementRef = useRef<HTMLInputElement>(null);
  const dropdownToggleElementRef = useRef<HTMLButtonElement>(null);

  function languages() {
    const visibleLanguages = Languages.find({ visible: true });
    const languageSearch = search.toLowerCase();
    const results: LanguageEntity[] = [];

    visibleLanguages.forEach((visibleLanguage) => {
      let pushed = false;
      [visibleLanguage.name, visibleLanguage.english].every((property) => {
        if (pushed) {
          return false;
        }
        if (property.toLowerCase().includes(languageSearch)) {
          results.push(visibleLanguage);
          pushed = true;
        }
        return true;
      });
    });
    return results;
  }

  function changeLanguage(language: LanguageEntity) {
    setSearchHasFocus(false);

    routerAutoscroll.cancelNext();

    const { lg } = language;

    try {
      localStorage.setItem("locale", lg);
    } catch {
      // ignore See: https://developer.mozilla.org/en-US/docs/Web/API/Storage/setItem#exceptions
    }
    // The db user update happens in the /imports/startup/client/locale.ts in Tracker.autorun(() => { ...
    Session.set("locale", lg);

    props.onSelect?.();
    props.onClose?.();
  }

  function inNavbarClasses() {
    if (props.inNavbar) {
      return "nav-item text-center col col-lg-auto";
    }
    return "";
  }
  function currentLanguage() {
    return Languages.find(locale).fetch()[0];
  }
  function isCurrentLanguage(language: LanguageEntity) {
    return language.lg === locale;
  }
  function helpLink() {
    return getLocalizedValue(PublicSettings.i18nHelpLink);
  }

  useEffect(() => {
    if (searchHasFocus) {
      if (!dropdownToggleElementRef.current)
        throw new Error("Unexpected falsy: dropdownToggleElementRef.current");
      $(dropdownToggleElementRef.current).dropdown("show");

      if (!searchElementRef.current) throw new Error("Unexpected falsy: searchElementRef.current");
      searchElementRef.current?.select();
    }
  }, [searchHasFocus]);

  useEffect(() => {
    if (!dropdownToggleElementRef.current)
      throw new Error("Unexpected falsy: dropdownToggleElementRef.current");
    dropdownToggleElementRef.current.addEventListener("hide.bs.dropdown", (event) => {
      if (!searchHasFocus) {
        props.onClose?.();
        return true;
      }

      // Stop closing
      event.preventDefault();
      return false;
    });
  });

  function handleSearchKeyUp(event: React.KeyboardEvent<HTMLInputElement>) {
    const newSearch = event.currentTarget.value.trim();
    if (newSearch !== search) {
      setSearch(newSearch);
    }
  }

  function handleSearchFocus() {
    setSearchHasFocus(true);
  }

  function handleSearchBlur() {
    setSearchHasFocus(false);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (languages()[0]) {
      changeLanguage(languages()[0]);
    }
  }

  return (
    <li className={`language-selection ${inNavbarClasses()}`}>
      <form className="d-flex language-selection-form" tabIndex={0} onSubmit={handleSubmit}>
        <div className="input-group input-group-outline input-group-sm p-2">
          <span className="input-group-text">
            <i className="fa-solid fa-globe fa-fw" />
          </span>
          <input
            ref={searchElementRef}
            className="form-control"
            type="text"
            defaultValue={currentLanguage().name}
            onKeyUp={handleSearchKeyUp}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
          />
          <input className="d-none" type="submit" />
          <button
            className="btn dropdown-toggle"
            data-bs-toggle="dropdown"
            role="button"
            aria-expanded="false"
            data-bs-auto-close="outside"
            tabIndex={-1}
            ref={dropdownToggleElementRef}
          ></button>
          <ul className="dropdown-menu dropdown-menu-end mx-2" role="menu">
            {languages() ? (
              <>
                <li className="dropdown-header dropdown-legend">
                  <div className="dropdown-addon-right">
                    {t("languageSelection.translatedPercent", "% translated")}
                  </div>
                  {t("languageSelection.legend.language", "Language")}
                </li>
                {languages().map((language) => (
                  <li key={language.lg}>
                    <a
                      href="#"
                      className={`dropdown-item ${isCurrentLanguage(language) ? "fw-bold" : ""}`}
                      title={language.english}
                      onClick={() => changeLanguage(language)}
                    >
                      {isCurrentLanguage(language) && (
                        <>
                          <span className="checkmark fa-solid fa-check"></span>{" "}
                        </>
                      )}
                      {!!language.translatedPercent && (
                        <div className="dropdown-addon-right">{language.translatedPercent} %</div>
                      )}
                      <div className="language-name">
                        <MarkedName search={search} name={language.name} />
                      </div>
                    </a>
                  </li>
                ))}
              </>
            ) : (
              <li>
                <a className="dropdown-item">
                  {t("languageSelection.noLanguagesFound", "No languages found.")}
                </a>
              </li>
            )}
            {!!helpLink() && (
              <>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <a className="dropdown-item" href={helpLink()} target="_blank" rel="noreferrer">
                    {t("Profile.translate_this_page", "Help us to translate this Page")}
                  </a>
                </li>
              </>
            )}
          </ul>
        </div>
      </form>
    </li>
  );
}
