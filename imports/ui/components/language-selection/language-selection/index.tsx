import React, { useEffect, useRef, useState } from "react";
import { _ } from "meteor/underscore";
import { useTranslation } from "react-i18next";
import { useSession } from "/imports/utils/react-meteor-data";

import { LanguageEntity, Languages } from "/imports/api/languages/languages";

import { routerAutoscroll } from "/imports/ui/lib/router-autoscroll";

import { PublicSettings } from "/imports/utils/PublicSettings";
import { MarkedName } from "/imports/utils/marked-name";
import { getLocalizedValue } from "/imports/utils/getLocalizedValue";

import "./styles.scss";

export function Selection(data: { inNavbar: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const locale = useSession("locale");
  const [searchHasFocus, setSearchHasFocus] = useState(true);
  const searchElementRef = useRef<HTMLInputElement>(null);
  const dropdownToggleElementRef = useRef<HTMLButtonElement>(null);

  const updateLanguageSearch = _.debounce(() => {
    if (!searchElementRef.current) throw new Error("Unexpected falsy: searchElementRef.current");
    const newSearch = searchElementRef.current?.value.trim();
    if (search !== newSearch) {
      setSearch(newSearch);
    }
  }, 100);

  function inNavbarClasses() {
    if (data.inNavbar) {
      return "nav-item text-center col col-lg-auto";
    }
    return "";
  }
  function setLanguage() {
    return Languages.find(locale).fetch()[0];
  }
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
  function languageNameMarked(language: LanguageEntity) {
    const { name } = language;
    return <MarkedName search={search} name={name} />;
  }
  function currentLanguage(language: LanguageEntity) {
    return language.lg === locale;
  }
  function helpLink() {
    return getLocalizedValue(PublicSettings.i18nHelpLink);
  }

  const handleKeyUp = () => {
    setSearchHasFocus(true);
    updateLanguageSearch();
  };

  function handelSearchFocus() {
    setSearchHasFocus(true);
  }

  function handelSearchBlur() {
    setSearchHasFocus(false);
  }

  function handelChange(language: LanguageEntity) {
    routerAutoscroll.cancelNext();

    setSearchHasFocus(false);

    const { lg } = language;

    try {
      localStorage.setItem("locale", lg);
    } catch {
      // ignore See: https://developer.mozilla.org/en-US/docs/Web/API/Storage/setItem#exceptions
    }
    // The db user update happens in the /imports/startup/client/locale.ts in Tracker.autorun(() => { ...
    Session.set("locale", lg);

    data.onClose();
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
    dropdownToggleElementRef.current.addEventListener("hide.bs.dropdown", () => {
      if (!searchHasFocus) {
        data.onClose();
        return true;
      }
      return false;
    });
  });

  return (
    <li className={`language-selection ${inNavbarClasses()}`}>
      <form
        className="d-flex js-language-selection-form language-selection-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (languages()[0]) {
            handelChange(languages()[0]);
          }
        }}
      >
        <div className="input-group input-group-sm input-group-outline p-2">
          <span className="input-group-text">
            <span className="fa-solid fa-globe fa-fw" aria-hidden="true"></span>
          </span>
          <input
            type="text"
            className="form-control"
            ref={searchElementRef}
            defaultValue={setLanguage().name}
            onKeyUp={handleKeyUp}
            onFocus={handelSearchFocus}
            onBlur={handelSearchBlur}
          />
          <input className="d-none" type="submit" />
          <button
            className="btn dropdown-toggle"
            data-bs-toggle="dropdown"
            role="button"
            aria-expanded="false"
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
                      className={`dropdown-item js-nav-dropdown-close ${
                        currentLanguage(language) ? "fw-bold" : ""
                      }`}
                      title={language.english}
                      onClick={() => {
                        handelChange(language);
                      }}
                    >
                      {currentLanguage(language) ? (
                        <>
                          <span className="checkmark fa-solid fa-check"></span>{" "}
                        </>
                      ) : null}
                      {language.translatedPercent ? (
                        <div className="dropdown-addon-right">{language.translatedPercent} %</div>
                      ) : null}
                      <div className="language-name">{languageNameMarked(language)}</div>
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
            {helpLink() ? (
              <>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <a className="dropdown-item" href={helpLink()} target="_blank">
                    {t("Profile.translate_this_page", "Help us to translate this Page")}
                  </a>
                </li>
              </>
            ) : null}
          </ul>
        </div>
      </form>
    </li>
  );
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("LanguageSelection", () => Selection);
