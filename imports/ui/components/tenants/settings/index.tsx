import { ReactiveVar } from "meteor/reactive-var";
import { Router } from "meteor/iron:router";
import { i18n } from "/imports/startup/both/i18next";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";

import * as Alert from "/imports/api/alerts/alert";
import { Tenants } from "/imports/api/tenants/tenants";
import { UserModel, Users } from "/imports/api/users/users";

import { routerAutoscroll } from "/imports/ui/lib/router-autoscroll";

import * as TenantsMethods from "/imports/api/tenants/methods";
import { userSearchPrefix } from "/imports/utils/user-search-prefix";

import "/imports/ui/components/buttons";
import "/imports/ui/components/invitations";
import "/imports/ui/components/joinLink";

import "./template.html";
import "./styles.scss";

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
  return  <div class="row">
    <div class="col-md">
      <h3>
        <span class="fa-solid fa-users fa-fw" aria-hidden="true"></span>
        {{i18n 'tenant.settings.title.Members' 'Members'}} ({{members.length}})
      </h3>
      <div class="icon-text-icon">
        <div class="icon-text-text">
          {{i18n 'tenant.settings.members.description' 'Members can see and use the above regions in the organisation {TENANT}.' TENANT=tenantName}}
        </div>
      </div>
      <br />
      <div class="tag-group multiline">
        {{#each members}}
          <div class="tag tag-btn tenant-member-tag-btn-remove">
            <button class="js-member-remove-btn"
                    title="{{i18n 'tenant.settings.removeFromTenant' 'remove member' attr=true}}"
                    type="button">
              <i class="fa-solid fa-xmark fa-fw" aria-hidden="true"></i>
              {{username this}}
            </button>
          </div>
          <div class="tag tag-link tenant-member-tag-profile addon">
            <a href="{{pathFor 'userprofile' _id=this}}"
               title="{{i18n 'tenant.settings.member.profile' 'Visit profile' attr=true}}">
              <i class="fa-solid fa-user fa-fw" aria-hidden="true"></i>
            </a>
          </div>
        {{/each}}
      </div>
      <div class="mb-3">
        <label
               class="form-label">{{i18n 'tenant.settings.field.addMembers' 'Add existing {SITENAME} members to your "{TENANTNAME}" organization.' SITENAME=siteName TENANTNAME=tenantName}}</label>
        <div class="input-group">
          <span class="input-group-text">
            <span class="fa-solid fa-user fa-fw" aria-hidden="true"></span>
          </span>
          <input class="js-search-members form-control" id="AddTenantMember"
                 placeholder="{{i18n 'tenant.settings.field.addMember.placeholder' 'Type name of buddy' attr=true}}"
                 size="40" type="text" />
        </div>
      </div>
      <div class="tag-group multiline">
        {{#each foundMembers}}
          <div class="tag tag-btn tenant-member-tag-btn-add">
            <button class="js-member-add-btn"
                    title="{{i18n 'tenant.settings.addMember' 'add as member' attr=true}}"
                    type="button">
              <i class="fa-solid fa-plus fa-fw" aria-hidden="true"></i>
              {{username this._id}}
            </button>
          </div>
          <div class="tag tag-link tenant-member-tag-profile addon">
            <a href="{{pathFor 'userprofile' _id=this._id}}"
               title="{{i18n 'tenant.settings.member.profile' attr=true}}">
              <i class="fa-solid fa-user fa-fw" aria-hidden="true"></i>
            </a>
          </div>
        {{/each}}
      </div>
      <hr />
      {{> joinLink tenant=tenant}}
      <hr />
      {{> invitations tenant=tenant}}
    </div>
    <div class="col-md">
      <h3>
        <span class="fa-solid fa-users fa-fw" aria-hidden="true"></span>
        {{i18n 'tenant.settings.title.admin' 'Admins'}} ({{tenant.admins.length}})
      </h3>
      <div class="icon-text-text">
        {{i18n 'tenant.settings.admin.description' 'Admins are empowered to see and manage this panel here, like you.'}}
      </div>
      <br />
      <div class="tag-group multiline">
        {{#each tenant.admins}}
          <div class="tag tag-btn tenant-admin-tag-btn-remove">
            <button class="js-admin-remove-btn"
                    title="{{i18n 'tenant.settings.removeAdminFromTenant' 'remove admin' attr=true}}"
                    type="button">
              <i class="fa-solid fa-xmark fa-fw" aria-hidden="true"></i>
              {{username this}}
            </button>
          </div>
          <div class="tag tag-link tenant-admin-tag-profile addon">
            <a href="{{pathFor 'userprofile' _id=this}}"
               title="{{i18n 'tenant.settings.admin.profile' 'Visit profile' attr=true}}">
              <i class="fa-solid fa-user fa-fw" aria-hidden="true"></i>
            </a>
          </div>
        {{/each}}
      </div>
      <div class="mb-3">
        <label
               class="form-label">{{i18n 'tenant.settings.field.addAdmins' 'Add an existing {SITENAME} user as a new admin to your "{TENANTNAME}" organization.' SITENAME=siteName TENANTNAME=tenantName}}</label>
        <div class="input-group">
          <span class="input-group-text">
            <span class="fa-solid fa-user fa-fw" aria-hidden="true"></span>
          </span>
          <input class="js-search-admins form-control" id="AddTenantAdmin"
                 placeholder="{{i18n 'tenant.settings.field.addAdmin.placeholder' 'Type name of buddy' attr=true}}"
                 size="40" type="text" />
        </div>
      </div>
      <div class="tag-group multiline">
        {{#each foundAdmins}}
          <div class="tag tag-btn tenant-admin-tag-btn-add">
            <button class="js-admin-add-btn"
                    title="{{i18n 'tenant.settings.addAdmin' 'add as admin' attr=true}}"
                    type="button">
              <i class="fa-solid fa-plus fa-fw" aria-hidden="true"></i>
              {{username this._id}}
            </button>
          </div>
          <div class="tag tag-link tenant-admin-tag-profile addon">
            <a href="{{pathFor 'userprofile' _id=this._id}}"
               title="{{i18n 'tenant.settings.admin.profile' attr=true}}">
              <i class="fa-solid fa-user fa-fw" aria-hidden="true"></i>
            </a>
          </div>
        {{/each}}
      </div>
    </div>
  </div>
}
