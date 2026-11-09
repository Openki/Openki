import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import ReactSelect, { components, GroupBase, InputProps, StylesConfig } from "react-select";

import { FindParams } from "/imports/api/groups/groups";
import { useFindFilter } from "/imports/api/groups/publications";
import { useDetails } from "/imports/api/organizations/publications";
import * as Predicates from "/imports/utils/predicates";

import { useCurrentRegionId } from "/imports/ui/hooks/useCurrentRegion";
import { useSearchParams } from "/imports/ui/hooks/react-meteor-router";
import { SortSpec } from "/imports/utils/sort-spec";
import { Filtering } from "/imports/utils/filtering";
import { CssFromQuery } from "/imports/ui/lib/css-from-query";
import { useSiteName } from "/imports/utils/getSiteName";
import { cx } from "/imports/utils/cx";

import { MetaTags } from "/imports/ui/components/MetaTags";
import { AccountTasks } from "/imports/ui/components/account-tasks";
import { GroupCompact } from "/imports/ui/components/groups/compact.modern";
import { CompactPropose } from "/imports/ui/components/groups/compact.modern.propose";
import { Button } from "/imports/ui/components/Buttons";
import { LanguageSelection } from "/imports/ui/components/language-selection";
import { OrganizationName } from "/imports/ui/components/OrganizationName";

import "./styles.scss";

const NoneKeyboardInput = (
  props: React.JSX.IntrinsicAttributes & InputProps<unknown, boolean, GroupBase<unknown>>,
) => <components.Input {...props} inputMode="none" />;

const DododoColor = "#2E0D74";

export function Background({ organizationId }: { organizationId?: string | undefined }) {
  const { t } = useTranslation();

  const [isLoading, organization] = useDetails({ when: !!organizationId }, organizationId);

  if (isLoading() || !organization) {
    return null;
  }

  const organizationLogoUrl = organization.publicLogoUrl();

  return (
    <>
      <MetaTags
        title={organization.name}
        description={organization.claim}
        image={organizationLogoUrl}
      />

      <div className="position-absolute top-50 start-50 translate-middle fs-1 fw-bold text-center">
        {organizationLogoUrl ? (
          <div>
            <span
              className="d-inline-block bg-white rounded-circle"
              style={{
                backgroundImage: `url(${organizationLogoUrl})`,
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                width: "300px",
                height: "300px",
              }}
            />
          </div>
        ) : (
          <h1>{organization.name}</h1>
        )}

        {t("rummagePage.question", "Where would you like to get involved?")}
      </div>
    </>
  );
}

function Rummage({
  sorted,
  animated,
  organization,
}: {
  sorted: boolean;
  animated: boolean;
  organization: string | undefined;
}) {
  let query = useSearchParams();
  const region = useCurrentRegionId();
  query = { ...query, region };

  // Create filter with selected organization
  const filter = new Filtering(FindParams).read(query);
  if (organization) {
    filter.set("organization", organization);
  }

  const count = Number.parseInt(query.count || "", 10) || 100;
  const sort = query.sort ? SortSpec.fromString(query.sort) : SortSpec.unordered();
  const [isLoading, groups] = useFindFilter(filter.toQuery(), count, undefined, sort.spec());

  if (isLoading()) {
    return null;
  }

  return (
    <div
      className={cx(
        "col-12 d-flex align-content-baseline flex-wrap gap-3 justify-content-center rummage position-relative py-3",
        sorted && "sorted",
        animated && "animated",
      )}
    >
      <CompactPropose organization={organization} draggable />
      {groups.map((group) => (
        <GroupCompact key={group._id} group={group} draggable />
      ))}
    </div>
  );
}

export function KioskRummagePage() {
  const { t } = useTranslation();
  const siteName = useSiteName();

  const [sorted, setSorted] = useState(false);
  const [animated, setAnimated] = useState(false);
  const [slideOut, setSlideOut] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setSlideOut(true);
    }, 5000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleSlideOut = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setSlideOut(true);
  };

  const query = useSearchParams();
  const style = new CssFromQuery(query, [
    ["color", "color", ".rummage-about-btn"],
    ["color", "border-color", ".rummage-about-btn"],
    ["color", "color", ".rummage-language-selection .btn"],
  ]).getCssRules();

  const filter = new Filtering({
    teamOrganization: Predicates.id,
    otherOrganizations: Predicates.ids,
  }).read(query);

  const teamOrganization = filter.get("teamOrganization");
  const otherOrganizations = filter.get("otherOrganizations") || [];
  const allOrganizations = teamOrganization
    ? [teamOrganization, ...otherOrganizations]
    : otherOrganizations;

  // State for selected organization
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | undefined>(
    teamOrganization,
  );

  const [isLoadingOrganization, organization] = useDetails(
    { when: !!selectedOrganizationId },
    selectedOrganizationId,
  );

  // Create options for ReactSelect
  const options: {
    value: string;
    label: React.JSX.Element;
  }[] = allOrganizations.map((id) => ({
    value: id,
    label: <OrganizationName id={id} />,
  }));

  const customStyles: StylesConfig<unknown, boolean, GroupBase<unknown>> | undefined = {
    control: (provided) => ({
      ...provided,
      backgroundColor: DododoColor,
      border: "2px solid white",
      borderRadius: "50px",
      minHeight: "60px",
      boxShadow: "none",
      textAlign: "center",
      "&:hover": {
        borderColor: "white",
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "white",
      fontSize: "1.75rem",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? DododoColor : "white",
      color: state.isFocused ? "white" : DododoColor,
      textAlign: "center",
      fontSize: "1.25rem",
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: "white",
      "&:hover": {
        color: "white",
      },
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: "20px",
      overflow: "hidden",
    }),
  };

  return (
    <>
      <style>{style}</style>
      <div
        className="position-relative"
        style={{
          /* special case for draggable: 86400000 is the top z-index over all cards and +1 over a open canvas */
          zIndex: 86400002,
        }}
      >
        <AccountTasks />
      </div>
      <div className="position-relative">
        <div className="position-absolute top-0 start-0 end-0 bottom-0" style={{ zIndex: -1 }}>
          <Background organizationId={selectedOrganizationId} />
        </div>
        <div className="overflow-hidden min-vh-100">
          <Rummage sorted={sorted} animated={animated} organization={selectedOrganizationId} />
        </div>
        <div
          className="position-absolute top-0 end-0"
          style={{
            /* special case for draggable: 86400000 is the top z-index over all cards  */
            zIndex: 86400001,
          }}
        >
          <div className="rummage-language-selection">
            <LanguageSelection />
          </div>
          <button
            id="rummage-about-btn"
            className="rummage-about-btn btn text-nowrap btn-lg btn-outline-primary d-inline-flex rounded-circle p-2 m-3 float-end fs-3 border-3"
            aria-label={t("rummagePage.aboutBtn", "Open about panel")}
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvas"
            aria-controls="offcanvas"
          >
            <i className="fa-solid fa-question w-[1em]" />
          </button>
          <div
            className="offcanvas offcanvas-end text-white"
            style={{ backgroundColor: DododoColor }}
            tabIndex={-1}
            id="offcanvas"
            aria-labelledby="offcanvasLabel"
          >
            <div className="offcanvas-header">
              <h2 className="offcanvas-title" id="offcanvasLabel">
                DO DO DO
                <br />
                by Openki
              </h2>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="offcanvas"
                aria-label={t("_button.close")}
              />
            </div>
            <div className="offcanvas-body d-flex flex-column justify-content-between">
              <div>
                <div className="fs-4">
                  {t(
                    "rummagePage.aboutText",
                    "DO DO DO is the platform for everyone who wants to make a difference – simply and for free. Share your idea and get started.",
                    { SITENAME: siteName },
                  )}
                </div>
                {!!(options?.length > 1) && (
                  <div className="fs-5 mt-5">
                    {t("rummagePage.togetherWith", "Together with")}
                    <ReactSelect
                      className="mt-1 fs-3"
                      value={options.find((opt) => opt.value === selectedOrganizationId)}
                      options={options}
                      styles={customStyles}
                      isSearchable={false}
                      components={{ Input: NoneKeyboardInput }}
                      onChange={(newValue: any) => {
                        if (newValue) {
                          setSelectedOrganizationId(newValue.value);
                        }
                      }}
                    />
                    {selectedOrganizationId !== teamOrganization &&
                      !isLoadingOrganization() &&
                      !!organization && (
                        <p
                          className="lead m-1"
                          dangerouslySetInnerHTML={{ __html: organization.description }}
                        />
                      )}
                  </div>
                )}
              </div>

              <Button
                block
                className="btn-outline-light fs-3 rounded-pill border-2"
                size="large"
                id="rummage-sort-btn"
                onClick={() => {
                  if (sorted) {
                    setTimeout(() => {
                      setAnimated(false);
                    }, 500);
                  } else {
                    setAnimated(true);
                  }
                  setSorted(!sorted);
                }}
              >
                {sorted
                  ? t("rummagePage.sortBtn.shuffle", "Shuffle")
                  : t("rummagePage.sortBtn.sort", "Sort")}
              </Button>
            </div>
          </div>
        </div>
        <div
          className={cx(
            "position-absolute top-0 start-0 end-0 bottom-0 overflow-hidden",
            slideOut && "pointer-events-none",
          )}
          style={{
            /* special case for draggable: 86400000 is the top z-index and +3 to set it as top layer */
            zIndex: 86400003,
          }}
        >
          <div
            className={cx(
              "position-absolute top-0 start-0 end-0 bottom-0 text-white fs-1",
              slideOut && "slide-out",
            )}
            style={{ backgroundColor: DododoColor }}
            onClick={handleSlideOut}
          >
            <div className="position-absolute top-50 start-50 translate-middle fs-1 fw-bold text-center">
              <div>DO DO DO</div>
              <div>{t("rummagePage.touchMe", "You can touch me :) 👆")}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("KioskRummagePage", () => KioskRummagePage);
