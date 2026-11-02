import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import { FindParams } from "/imports/api/groups/groups";
import { useFindFilter } from "/imports/api/groups/publications";
import { useDetails } from "/imports/api/organizations/publications";

import { useCurrentRegionId } from "/imports/ui/hooks/useCurrentRegion";
import { useSearchParams } from "/imports/ui/hooks/react-meteor-router";
import { SortSpec } from "/imports/utils/sort-spec";
import { Filtering } from "/imports/utils/filtering";
import { CssFromQuery } from "/imports/ui/lib/css-from-query";
import { useSiteName } from "/imports/utils/getSiteName";
import { cx } from "/imports/utils/cx";

import { MetaTags } from "/imports/ui/components/MetaTags";
import { LoadingPage } from "/imports/ui/pages/loading";
import { AccountTasks } from "/imports/ui/components/account-tasks";
import { GroupCompact } from "/imports/ui/components/groups/compact.modern";
import { CompactPropose } from "/imports/ui/components/groups/compact.modern.propose";
import { Button } from "/imports/ui/components/Buttons";

import "./styles.scss";

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

  let query = useSearchParams();
  const style = new CssFromQuery(query).getCssRules();
  const region = useCurrentRegionId();
  query = { ...query, region };

  const filter = new Filtering(FindParams).read(query);
  const count = Number.parseInt(query.count || "", 10) || 100;
  const sort = query.sort ? SortSpec.fromString(query.sort) : SortSpec.unordered();
  const [isLoading, groups] = useFindFilter(filter.toQuery(), count, undefined, sort.spec());

  if (isLoading()) {
    return <LoadingPage />;
  }

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
          <Background organizationId={filter.get("organization")} />
        </div>
        <div className="overflow-hidden min-vh-100">
          <div
            className={cx(
              "col-12 d-flex align-content-baseline flex-wrap gap-3 justify-content-center rummage position-relative py-3",
              sorted && "sorted",
              animated && "animated",
            )}
          >
            <CompactPropose organization={filter.get("organization")} draggable />
            {groups.map((group) => (
              <GroupCompact key={group._id} group={group} draggable />
            ))}
          </div>
        </div>
        <div
          className="position-absolute top-0 end-0"
          style={{
            /* special case for draggable: 86400000 is the top z-index over all cards  */
            zIndex: 86400001,
          }}
        >
          <button
            id="rummage-about-btn"
            className="btn text-nowrap btn-lg btn-outline-primary d-inline-flex rounded-circle p-2 m-3 float-end fs-3 border-3"
            aria-label={t("rummagePage.aboutBtn", "Open about panel")}
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvas"
            aria-controls="offcanvas"
            style={{ color: DododoColor, borderColor: DododoColor }}
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
            <div className="offcanvas-body">
              <div className="fs-4">
                {t(
                  "rummagePage.aboutText",
                  "DO DO DO is the platform for everyone who wants to make a difference – simply and for free. Share your idea and get started.",
                  { SITENAME: siteName },
                )}
              </div>
              <Button
                block
                className="btn-outline-light fs-3 rounded-pill border-2 mt-5"
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
