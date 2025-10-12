import { ReactiveVar } from "meteor/reactive-var";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";

import { i18n } from "/imports/startup/both/i18next";
import * as Metatags from "/imports/utils/metatags";
import { userSearchPrefix } from "/imports/utils/user-search-prefix";

import "/imports/ui/components/buttons";

import "./template.html";

const Template = TemplateAny as TemplateStaticTyped<
  "adminUsersPage",
  Record<string, unknown>,
  { userSearch: ReactiveVar<string> }
>;

const template = Template.adminUsersPage;

template.onCreated(function () {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const instance = this;

  instance.autorun(() => {
    Metatags.setCommonTags(i18n("admin.users.windowtitle", "Users"));
  });

  instance.busy(false);

  instance.userSearch = new ReactiveVar("");

  instance.autorun(() => {
    const search = instance.userSearch.get();
    if (search.length > 0) {
      instance.subscribe("userSearch", search);
    }
  });
});

template.helpers({
  foundUsers() {
    const instance = Template.instance();

    const search = instance.userSearch.get();
    if (search === "") {
      return false;
    }

    return userSearchPrefix(search, { limit: 30 });
  },
});

template.events({
  "keyup .js-search-users"(_event, instance) {
    instance.userSearch.set(instance.$(".js-search-users").val() as string);
  },
});

export function AdminUsersPage(){
  return   <><h3>
    {{i18n 'users.title' 'Users'}}
  </h3>
  <div class="mb-3">
    <label class="form-label">{{i18n 'users.field.find.label' 'Find a user'}}</label>
    <div class="input-group">
      <span class="input-group-text">
        <span class="fa-solid fa-user fa-fw" aria-hidden="true"></span>
      </span>
      <input class="js-search-users form-control"
             placeholder="{{i18n 'users.field.find.placeholder' 'Type name of user' attr=true}}"
             size="40" type="text" />
    </div>
  </div>

  <div class="list-group">
    {{#each foundUsers}}
      <a href="{{pathFor 'userprofile' _id=this._id}}"
         class="list-group-item list-group-item-action">
        <span class="fa-solid fa-user fa-fw" aria-hidden="true"></span>
        {{username this._id}}
      </a>
    {{/each}}
  </div></>
}
