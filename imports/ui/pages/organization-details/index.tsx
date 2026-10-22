import React, { useState } from "react";
import { Router } from "meteor/iron:router";
import { useUser } from "meteor/react-meteor-accounts";
import { useTranslation } from "react-i18next";
import { useValidation } from "/imports/ui/hooks/useValidation";
import { PublicSettings } from "/imports/utils/PublicSettings";

import * as Alert from "/imports/api/alerts/alert";
import { OrganizationModel } from "/imports/api/organizations/organizations";
import * as OrganizationsMethods from "/imports/api/organizations/methods";

import * as Analytics from "/imports/ui/lib/analytics";
import { Store } from "/imports/ui/lib/editable";
import { MetaTags } from "/imports/ui/components/MetaTags";
import { useCurrentRegion } from "/imports/ui/hooks/useCurrentRegion";
import { cx } from "/imports/utils/cx";

import { Editable, Props as EditableProps } from "/imports/ui/components/editable";

import { ButtonCancel, ButtonSave } from "/imports/ui/components/Buttons";
import { Find } from "../../components/groups/find";
import { Dashboard, Props as DashboardProps } from "../../components/dashboard";
import { VenueTag } from "../../components/venues/link";
import { OrganizationSettings } from "../../components/organizations/settings";

import "./styles.scss";

function allSet(organization: {
  name: string | undefined;
  short: string | undefined;
  claim: string | undefined;
  description: string | undefined;
}): organization is {
  name: string;
  short: string;
  claim: string;
  description: string;
} {
  return Object.values(organization).every((u) => u);
}

export interface Props {
  groupQuery: Record<string, string | undefined> & {
    organization: string;
    region: string | undefined;
  };
  organization: OrganizationModel;
  showGroups: boolean;
}

export function OrganizationDetailsPage({ groupQuery, organization, showGroups }: Props) {
  const { t } = useTranslation();
  const region = useCurrentRegion();
  const [editingSettings, setEditingSettings] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [errors, , addError, resetErrors] = useValidation({
    emptyField: {
      text: () => t("organizationDetails.error.allMandatory", "All four fields are mandatory."),
      field: "all",
    },
  });
  const [newOrganization, setNewOrganization] = useState<{
    name: string | undefined;
    short: string | undefined;
    claim: string | undefined;
    description: string | undefined;
  }>({ name: undefined, short: undefined, claim: undefined, description: undefined });

  const user = useUser();

  const canEdit = organization.editableBy(user);

  function isFeatured() {
    return !!region && !organization.isNew() && region.featuredOrganization === organization._id;
  }

  function allowEditingSettings() {
    return canEdit && !organization.isNew() && editingSettings;
  }
  function dashboardAttr(): DashboardProps {
    return {
      list: organization.dashboard || PublicSettings.organizationDashboardDefault || [],
      defaultRegion: region?._id || "",
      defaultOrganization: organization._id,
    };
  }

  const handleSaving: Store = {
    clientValidations: {
      all: {
        check: (text) => !!text,
        errorMessage: () => t("organizationDetails.error.allMandatory"),
      },
    },
    onSuccess: () => {
      Alert.success(
        t(
          "organizationDetails.changesSaved",
          'Changes to the "{ORGANIZATION}" organization have been saved.',
          {
            ORGANIZATION: organization.name,
          },
        ),
      );
    },
    onError: (err) => {
      Alert.serverError(
        err as string | Error,
        t("organizationDetails.saveError", 'Could not save the "{ORGANIZATION}" organization', {
          ORGANIZATION: organization.name,
        }),
      );
    },
  };

  const handleSave = async () => {
    resetErrors();

    if (!allSet(newOrganization)) {
      addError("emptyField");
      return;
    }

    setIsBusy(true);
    try {
      const organizationId = await OrganizationsMethods.save("", newOrganization);

      Alert.success(
        t("organizationDetails.created", 'The "{ORGANIZATION}" organization was created.', {
          ORGANIZATION: newOrganization.name,
        }),
      );

      Analytics.trackEvent("Organization creations", "Organization creations");

      Router.go("organizationDetails", { _id: organizationId, short: newOrganization.short });
    } catch (err) {
      Alert.serverError(
        err,
        t("organizationDetails.saveError", { ORGANIZATION: newOrganization.name }),
      );
    } finally {
      setIsBusy(false);
    }
  };

  const handleCancel = () => {
    Router.go("profile"); // Got a better idea?
  };

  const showControls = !organization.isNew();

  const editableNameAttr: EditableProps = {
    text: organization.name,
    multiline: false,
    placeholder: t(
      "organization.name.placeholder",
      "Name of your organization, institution, community or program",
    ),
    store: showControls
      ? {
          ...handleSaving,
          onSave: async (newName) => {
            await OrganizationsMethods.save(organization._id, { name: newName });
          },
        }
      : undefined,
    onChange: (newName) => {
      setNewOrganization((state) => ({ ...state, name: newName }));
    },
  };

  const editableShortAttr: EditableProps = {
    text: organization.short,
    multiline: false,
    placeholder: t("organization.short.placeholder", "Abbreviation"),
    store: showControls
      ? {
          ...handleSaving,
          onSave: async (newShort) => {
            await OrganizationsMethods.save(organization._id, { short: newShort });
          },
        }
      : undefined,
    onChange: (newText) => {
      setNewOrganization((state) => ({ ...state, short: newText }));
    },
  };

  const editableClaimAttr: EditableProps = {
    text: organization.claim,
    multiline: false,
    placeholder: t("organization.claim.placeholder", "The core idea"),
    store: showControls
      ? {
          ...handleSaving,
          onSave: async (newClaim) => {
            await OrganizationsMethods.save(organization._id, { claim: newClaim });
          },
        }
      : undefined,
    onChange: (newClaim) => {
      setNewOrganization((state) => ({ ...state, claim: newClaim }));
    },
  };

  const editableDescriptionAttr: EditableProps = {
    text: organization.description,
    multiline: true,
    placeholder: t(
      "organization.description.placeholder",
      "Describe the audience, the interests and activities of your organization.",
    ),
    store: showControls
      ? {
          ...handleSaving,
          onSave: async (newDescription) => {
            await OrganizationsMethods.save(organization._id, { description: newDescription });
          },
        }
      : undefined,
    onChange: (newDescription) => {
      setNewOrganization((state) => ({ ...state, description: newDescription }));
    },
  };

  const title =
    organization.name || t("organizationDetails.windowtitle.create", "Create organization");

  return (
    <>
      <MetaTags
        title={title}
        description={organization.claim}
        image={organization.publicLogoUrl()}
      />

      <div className="container mb-4">
        {organization.isNew() && (
          <h2>{t("organizationDetails.titleNew", "Create new organization")}</h2>
        )}
        <div className="page-component organization-details">
          <div className="organization-details-titlebar clearfix">
            {t("organizationDetails.organization", "Organization")}

            {isFeatured() && (
              <>
                {" "}
                <i
                  title={t("organizationDetails.isFeatured", "This organization is featured")}
                  className="fa-solid fa-star fa-fw"
                />
              </>
            )}

            <button
              className="btn btn-link float-end ms-2"
              data-bs-title={t("organizationDetails.removeFilter", "See all groups")}
              aria-label={t("organizationDetails.removeFilter", "See all groups")}
              onClick={() => {
                Router.go("home"); // Got a better idea?
              }}
            >
              <i className="fa-solid fa-xmark fa-lg" />
            </button>
            {!organization.isNew() && canEdit && (
              <button
                className="btn btn-link float-end ms-2"
                data-bs-title={t("organizations.settings.title")}
                aria-label={t("organizations.settings.title")}
                onClick={() => {
                  setEditingSettings(!editingSettings);
                }}
              >
                <i className="fa-solid fa-gear fa-lg" />
              </button>
            )}
          </div>
          <div
            className={cx(
              "details-header organization-details-header clearfix",
              organization.logoUrl && "has-logo",
              canEdit && "is-editable",
            )}
          >
            {!!organization.publicLogoUrl() && (
              <div className="organization-details-logo">
                <img src={organization.publicLogoUrl()} />
              </div>
            )}
            <div className="organization-details-name">
              {canEdit ? <Editable {...editableNameAttr} /> : organization.name}
            </div>{" "}
            <div className="organization-details-short">
              {canEdit ? <Editable {...editableShortAttr} /> : organization.short}
            </div>
          </div>
          <div className="details-body organization-details-body">
            <div
              className={cx(
                "details-content organization-details-content",
                !!errors.all && "has-error",
              )}
            >
              <div className="organization-details-claim">
                {canEdit ? <Editable {...editableClaimAttr} /> : organization.claim}
              </div>

              <div className="organization-details-description">
                {canEdit ? (
                  <Editable {...editableDescriptionAttr} />
                ) : (
                  <span dangerouslySetInnerHTML={{ __html: organization.description }}></span>
                )}
              </div>

              {!!errors.all && <span className="form-text d-block">{errors.all}</span>}

              {!!(organization.venues && organization.venues.length > 0) && (
                <div className="organization-details-venues">
                  {t("organization.details.venues", "{NUM, plural, one{Venue:} other{Venues:} }", {
                    NUM: organization.venues.length,
                  })}{" "}
                  <span className="tag-group">
                    {organization.venues.map((v) => (
                      <VenueTag key={v._id} venue={v} />
                    ))}
                  </span>
                </div>
              )}
            </div>
          </div>
          {organization.isNew() && (
            <div className="actions">
              <ButtonSave
                id="organization-details-save"
                needsLogin
                onClick={handleSave}
                disabled={isBusy}
              />
              <ButtonCancel
                id="organization-details-cancel"
                onClick={handleCancel}
                disabled={isBusy}
              />
            </div>
          )}
          {allowEditingSettings() && <OrganizationSettings organization={organization} />}
        </div>
        {!dashboardAttr().list.length && showGroups && <Find query={groupQuery} />}
      </div>
      {!!dashboardAttr().list.length && showGroups && <Dashboard {...dashboardAttr()} />}
    </>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("OrganizationDetailsPage", () => OrganizationDetailsPage);
