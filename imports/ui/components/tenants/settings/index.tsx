import React from "react";
import { ReactiveVar } from "meteor/reactive-var";
import { Router } from "meteor/iron:router";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";

import * as Alert from "/imports/api/alerts/alert";
import { Tenants } from "/imports/api/tenants/tenants";
import { UserModel, Users } from "/imports/api/users/users";

import { routerAutoscroll } from "/imports/ui/lib/router-autoscroll";

import * as TenantsMethods from "/imports/api/tenants/methods";
import { userSearchPrefix } from "/imports/utils/user-search-prefix";


import "./styles.scss";
import { useTranslation } from "react-i18next";

const Template = TemplateAny as TemplateStaticTyped<
  "tenantSettings",
  never,
  { memberSearch: ReactiveVar<string>; adminSearch: ReactiveVar<string> }
>;

const template = Template.tenantSettings;

template.onCreated(function () {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const instance = this;

  instance.busy(false);

  instance.memberSearch = new ReactiveVar("");
  instance.autorun(() => {
    const search = instance.memberSearch.get();
    if (search.length > 0) {
      instance.subscribe("userSearch", search);
    }
  });

  instance.adminSearch = new ReactiveVar("");
  instance.autorun(() => {
    const search = instance.adminSearch.get();
    if (search.length > 0) {
      instance.subscribe("userSearch", search);
    }
  });
});

template.helpers({
  tenantName() {
    const tenant = Tenants.findOne(Router.current().params._id);
    return tenant?.name;
  },
  members() {
    const tenant = Tenants.findOne(Router.current().params._id);
    return tenant?.members.filter((m) => !tenant?.admins?.includes(m));
  },
  foundMembers() {
    const instance = Template.instance();

    const search = instance.memberSearch.get();
    if (search === "") {
      return false;
    }

    const tenant = Tenants.findOne(Router.current().params._id);
    return userSearchPrefix(search, { exclude: tenant?.members, limit: 30 });
  },
  foundAdmins() {
    const instance = Template.instance();

    const search = instance.adminSearch.get();
    if (search === "") {
      return false;
    }

    const tenant = Tenants.findOne(Router.current().params._id);
    return userSearchPrefix(search, { exclude: tenant?.admins, limit: 30 });
  },
});

template.events({
  "keyup .js-search-members"(_event, instance) {
    instance.memberSearch.set(instance.$(".js-search-members").val() as string);
  },

  async "click .js-member-add-btn"(this: UserModel) {
    routerAutoscroll.cancelNext();

    const memberId = this._id;
    const tenantId = Router.current().params._id as string;
    try {
      await TenantsMethods.addMember(memberId, tenantId);
      const memberName = Users.findOne(memberId)?.getDisplayName();
      const tenantName = Tenants.findOne(tenantId)?.name;
      Alert.success(
        i18n(
          "tenantSettings.memberAdded",
          '"{MEMBER}" has been added to the "{TENANT}" organization',
          { MEMBER: memberName, TENANT: tenantName },
        ),
      );
    } catch (err) {
      Alert.serverError(err, i18n("tenantSettings.memberAdded.error", "Could not add member"));
    }
  },

  async "click .js-member-remove-btn"(this: UserModel) {
    routerAutoscroll.cancelNext();

    const memberId = `${this}`;
    const tenantId = Router.current().params._id as string;
    try {
      await TenantsMethods.removeMember(memberId, tenantId);

      const memberName = Users.findOne(memberId)?.getDisplayName();
      const tenantName = Tenants.findOne(tenantId)?.name;
      Alert.success(
        i18n(
          "tenantSettings.memberRemoved",
          '"{MEMBER}" has been removed from the "{TENANT}" organization',
          { MEMBER: memberName, TENANT: tenantName },
        ),
      );
    } catch (err) {
      Alert.serverError(err, i18n("tenantSettings.memberRemoved.error", "Could not remove member"));
    }
  },

  "keyup .js-search-admins"(_event, instance) {
    instance.adminSearch.set(instance.$(".js-search-admins").val() as string);
  },

  async "click .js-admin-add-btn"(this: UserModel) {
    routerAutoscroll.cancelNext();

    const adminId = this._id;
    const tenantId = Router.current().params._id as string;
    try {
      await TenantsMethods.addAdmin(adminId, tenantId);
      const adminName = Users.findOne(adminId)?.getDisplayName();
      const tenantName = Tenants.findOne(tenantId)?.name;
      Alert.success(
        i18n(
          "tenantSettings.adminAdded",
          '"{ADMIN}" has been added as admin of the "{TENANT}" organization',
          { ADMIN: adminName, TENANT: tenantName },
        ),
      );
    } catch (err) {
      Alert.serverError(err, i18n("tenantSettings.adminAdded.error", "Could not add admin"));
    }
  },

  async "click .js-admin-remove-btn"(this: UserModel) {
    routerAutoscroll.cancelNext();

    const adminId = `${this}`;
    const tenantId = Router.current().params._id as string;
    try {
      await TenantsMethods.removeAdmin(adminId, tenantId);

      const adminName = Users.findOne(adminId)?.getDisplayName();
      const tenantName = Tenants.findOne(tenantId)?.name;
      Alert.success(
        i18n(
          "tenantSettings.adminRemoved",
          '"{ADMIN}" has been removed as admin of the "{TENANT}" organization',
          { ADMIN: adminName, TENANT: tenantName },
        ),
      );
    } catch (err) {
      Alert.serverError(err, i18n("tenantSettings.adminRemoved.error", "Could not remove admin"));
    }
  },
});


export function Settings(){
   const { t } = useTranslation();
 
 return  <div className="row">
    <div className="col-md">
      <h3>
        <span className="fa-solid fa-users fa-fw" aria-hidden="true"/>{" "}
        {t('tenant.settings.title.Members', 'Members')} ({members.length})
      </h3>
      <div className="icon-text-icon">
        <div className="icon-text-text">
          {t('tenant.settings.members.description', 'Members can see and use the above regions in the organisation {TENANT}.' ,{TENANT:tenantName})}
        </div>
      </div>
      <br />
      <div className="tag-group multiline">
        {{#each members}}
          <div className="tag tag-btn tenant-member-tag-btn-remove">
            <button className="js-member-remove-btn"
                    title={t('tenant.settings.removeFromTenant', 'remove member')}
                    type="button">
              <i className="fa-solid fa-xmark fa-fw" aria-hidden="true"/>
              {{username this}}
            </button>
          </div>
          <div className="tag tag-link tenant-member-tag-profile addon">
            <a href="{{pathFor 'userprofile' _id=this}}"
               title={t('tenant.settings.member.profile', 'Visit profile')}>
              <i className="fa-solid fa-user fa-fw" aria-hidden="true"/>
            </a>
          </div>
        {{/each}}
      </div>
      <div className="mb-3">
        <label
               className="form-label">{t('tenant.settings.field.addMembers', 'Add existing {SITENAME} members to your "{TENANTNAME}" organization.' ,{SITENAME:siteName ,TENANTNAME:tenantName})}</label>
        <div className="input-group">
          <span className="input-group-text">
            <span className="fa-solid fa-user fa-fw" aria-hidden="true"/>
          </span>
          <input className="js-search-members form-control" id="AddTenantMember"
                 placeholder={t('tenant.settings.field.addMember.placeholder' ,'Type name of buddy' )}
                  type="text" />
        </div>
      </div>
      <div className="tag-group multiline">
        {{#each foundMembers}}
          <div className="tag tag-btn tenant-member-tag-btn-add">
            <button className="js-member-add-btn"
                    title={t('tenant.settings.addMember', 'add as member')}
                    type="button">
              <i className="fa-solid fa-plus fa-fw" aria-hidden="true"/>
              {{username this._id}}
            </button>
          </div>
          <div className="tag tag-link tenant-member-tag-profile addon">
            <a href="{{pathFor 'userprofile' _id=this._id}}"
               title={t('tenant.settings.member.profile')}>
              <i className="fa-solid fa-user fa-fw" aria-hidden="true"/>
            </a>
          </div>
        {{/each}}
      </div>
      <hr />
      {{> joinLink tenant=tenant}}
      <hr />
      {{> invitations tenant=tenant}}
    </div>
    <div className="col-md">
      <h3>
        <span className="fa-solid fa-users fa-fw" aria-hidden="true"/>
        {t('tenant.settings.title.admin', 'Admins')} ({tenant.admins.length})
      </h3>
      <div className="icon-text-text">
        {t('tenant.settings.admin.description' ,'Admins are empowered to see and manage this panel here, like you.')}
      </div>
      <br />
      <div className="tag-group multiline">
        {{#each tenant.admins}}
          <div className="tag tag-btn tenant-admin-tag-btn-remove">
            <button className="js-admin-remove-btn"
                    title={t('tenant.settings.removeAdminFromTenant' ,'remove admin')}
                    type="button">
              <i className="fa-solid fa-xmark fa-fw" aria-hidden="true"/>
              {{username this}}
            </button>
          </div>
          <div className="tag tag-link tenant-admin-tag-profile addon">
            <a href="{{pathFor 'userprofile' _id=this}}"
               title={t('tenant.settings.admin.profile' ,'Visit profile')}>
              <i className="fa-solid fa-user fa-fw" aria-hidden="true"/>
            </a>
          </div>
        {{/each}}
      </div>
      <div className="mb-3">
        <label
               className="form-label">{t('tenant.settings.field.addAdmins', 'Add an existing {SITENAME} user as a new admin to your "{TENANTNAME}" organization.',{ SITENAME:siteName, TENANTNAME:tenantName})}</label>
        <div className="input-group">
          <span className="input-group-text">
            <span className="fa-solid fa-user fa-fw" aria-hidden="true"/>
          </span>
          <input className="js-search-admins form-control" id="AddTenantAdmin"
                 placeholder={t('tenant.settings.field.addAdmin.placeholder' ,'Type name of buddy')}
                 type="text" />
        </div>
      </div>
      <div className="tag-group multiline">
        {{#each foundAdmins}}
          <div className="tag tag-btn tenant-admin-tag-btn-add">
            <button className="js-admin-add-btn"
                    title={t('tenant.settings.addAdmin', 'add as admin')}
                    type="button">
              <i className="fa-solid fa-plus fa-fw" aria-hidden="true"/>
              {{username this._id}}
            </button>
          </div>
          <div className="tag tag-link tenant-admin-tag-profile addon">
            <a href="{{pathFor 'userprofile' _id=this._id}}"
               title={t('tenant.settings.admin.profile')}>
              <i className="fa-solid fa-user fa-fw" aria-hidden="true"/>
            </a>
          </div>
        {{/each}}
      </div>
    </div>
  </div>
}
