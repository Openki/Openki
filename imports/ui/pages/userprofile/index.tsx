import React, { useEffect, useState } from "react";
import { Router } from "meteor/iron:router";
import { useTranslation } from "react-i18next";

import * as Alert from "/imports/api/alerts/alert";
import { GroupEntity, GroupModel } from "/imports/api/groups/groups";
import * as GroupsMethods from "/imports/api/groups/methods";
import { UserModel } from "/imports/api/users/users";
import * as usersMethods from "/imports/api/users/methods";
import * as emailMethods from "/imports/api/emails/methods";
import { useFindFilter } from "/imports/api/courses/publications";
import { useUser } from "/imports/utils/react-meteor-data";

import { PleaseLogin } from "/imports/ui/lib/please-login";
import { i18n } from "/imports/startup/both/i18next";
import * as Metatags from "/imports/utils/metatags";
import { checkContribution } from "/imports/utils/checkContribution";
import * as Tooltips from "/imports/utils/Tooltips";


import "./template.html";
import { Avatar } from "../../components/avatar";
import { Contribution } from "../../components/contribution";
import { PublicSettings } from "/imports/utils/PublicSettings";
import { SendMessage, Data as SendMessageData } from "/imports/ui/components/send-message";

import { CourseList } from "../../components/profiles/course-list";
import { ButtonDelete } from "../../components/buttons";

export interface UserProfilePageProps {
  user: UserModel;
  alterPrivileges: boolean;
  privileges:  Record<string, boolean>;
  inviteGroups: GroupModel[];
  showPrivileges: boolean;
}


template.events({
  async "click .js-has-contributed"(_event, instance) {
    const { data } = instance;
    try {
      await usersMethods.setHasContributed(data.user._id);

      Alert.success(i18n("profile.setHasContributed.alert", "User has contributed"));
    } catch (err) {
      Alert.serverError(
        err,
        i18n("profile.setHasContributed.error", "Unable to set user has contributed."),
      );
    }
  },

  async "click .js-unset-has-contributed"(_event, instance) {
    const { data } = instance;
    try {
      await usersMethods.unsetHasContributed(data.user._id);

      Alert.success(i18n("profile.unsetHasContributed.alert", "Unset user has contributed"));
    } catch (err) {
      Alert.serverError(
        err,
        i18n("profile.unsetHasContributed.error", "Unable to unset user has contributed."),
      );
    }
  },

  async "click .js-give-admin"(_event, instance) {
    const { data } = instance;
    try {
      await usersMethods.addPrivilege(data.user._id, "admin");

      Alert.success(i18n("privilege.addedAdmin", "Granted admin privilege"));
    } catch (err) {
      Alert.serverError(err, i18n("privilege.addedAdmin.error", "Unable to add privilege"));
    }
  },

  async "click .js-remove-privilege-btn"(event, instance) {
    const { data } = instance;
    const priv = instance.$(event.target as any).data("priv");
    try {
      await usersMethods.removePrivilege(data.user._id, priv);

      Alert.success(i18n("privilege.removed", "Removed privilege"));
    } catch (err) {
      Alert.serverError(err, i18n("privilege.removed.error", "Unable to remove privilege"));
    }
  },

  async "click .js-draft-into-group"(this: GroupEntity, _event, instance) {
    const { _id: groupId, name } = this;
    const { data } = instance;
    const userId = data.user._id;

    try {
      await GroupsMethods.updateMembership(userId, groupId, true);

      Alert.success(i18n("profile.group.drafted", "Added to group {NAME}", { NAME: name }));
    } catch (err) {
      Alert.serverError(
        err,
        i18n("profile.group.drafted.error", "Unable to draft user into group"),
      );
    }
  },

  async "click .js-group-expel-btn"(this: GroupEntity, _event, instance) {
    Tooltips.hide();

    const { _id: groupId, name } = this;
    const { data } = instance;
    const userId = data.user._id;

    try {
      await GroupsMethods.updateMembership(userId, groupId, false);

      Alert.success(i18n("profile.group.expelled", "Expelled from group {NAME}", { NAME: name }));
    } catch (err) {
      Alert.serverError(
        err,
        i18n("profile.group.expelled.error", "Unable to expel user from group"),
      );
    }
  },

  "click .js-verify-user-delete-collapse"() {
    const instance = Template.instance();
    instance.state.set("verifyUserDelete", !instance.state.get("verifyUserDelete"));
  },

  async "click .js-verify-user-delete-confirm"(_event, instance) {
    instance.busy("deleting");
    PleaseLogin(instance, async () => {
      const reason = instance.$(".js-reason").val() as string;

      if (reason.length < 4) {
        Alert.error(i18n("profile.admin.remove.reason.longertext", "longer text please"));
        instance.busy(false);
        return;
      }

      const userId = instance.data.user._id;

      try {
        await usersMethods.adminRemove(userId, reason, { courses: true });
        Alert.success(i18n("profile.account.deleted", "The account has been deleted"));
        Router.go("users");
      } finally {
        instance.busy(false);
      }
    });
  },
});

export function UserprofilePage(data: UserProfilePageProps){
  const { t } = useTranslation();
  
const [verifyUserDelete, setVerifyUserDelete]=useState(false)

const user = useUser()

  const [isLoading, coursesCreatedBy] = useFindFilter( { createdby: data.user._id });


/**
 * whether userprofile is for the logged-in user
 */
function ownuser() {
  return data.user._id === user?._id;
}
function hasContributed() {
  return checkContribution(data.user.contribution);
}
function allowPrivateMessages() {
  return data.user.allowPrivateMessages || !!user?.privileged("admin");
}
function groupMember(group: GroupEntity, user: UserModel) {
  return !!(user && group?.members?.some((m) => m.user === user._id));
}
function showInviteGroups() {

  if (data.user._id === user?._id) {
    return false;
  }
  return data.inviteGroups.length > 0;
}
function showSettings() {

  if (data.showPrivileges) {
    return true;
  }

  if (data.user._id === user?._id) {
    return false;
  }

  return data.inviteGroups.length > 0;
}
function sendMessageAttr(): SendMessageData {

  return {
    placeholder: t("profile.mail.placeholder", "Hi {USER}. I wanted to tell you…", {
      USER: data.user.username,
    }),
    onSend: async (message, options) => {
      await emailMethods.sendPrivateMessage(data.user._id, message, options);
    },
  };
}
function numberOfCoursesAffectedByDelete() {
  return  coursesCreatedBy.length;
}
function numberOfInterestedAffectedByDelete() {
  return coursesCreatedBy
    .reduce((accumulator, currentValue) => accumulator + currentValue.interested, 0);
}
function numberOfFutureEventsAffectedByDelete() {
  return coursesCreatedBy
    .reduce((accumulator, currentValue) => accumulator + currentValue.futureEvents, 0);
}

useEffect(() => {
  const title = t("profile.windowtitle", "Profile of {USER}", { USER: data.user.getDisplayName() });
  Metatags.setCommonTags(title);
 });

if(isLoading()){
  return null
}

  return  <div className="container mw-md">
  <div className="page-component">
    <div className="row g-3">
      <div className="col-3">
        <Avatar userId={data.user._id} className="profile-avatar"/>
      </div>

      <div className="col-9">
        <h1 className="mt-4">
          {t('profile.users_profile_page' ,"{NAME}'s Profile",{ NAME:data.user.getDisplayName()})}
          <Contribution userId={data.user._id}/>
        </h1>
        {ownuser() ?
        
        <em>({t('profile.its_you' ,"It's you.")})</em>
      :
      data.alterPrivileges && PublicSettings.contribution && (
!hasContributed()?
<button type="button" className="btn btn-primary js-has-contributed">
<i className={PublicSettings.contribution.icon} aria-hidden="true"></i>
{t('profile.setHasContributed.button' ,'Mark this user has contributed')}
</button>
:
<button type="button" className="btn btn-secondary js-unset-has-contributed">
{t('profile.unsetHasContributed.button', 'Remove this user has contributed')}
</button>

      )
      
      }
        

        <p className="profile-description"  dangerouslySetInnerHTML={{ __html:data. user.description }}></p>
{ownuser()?
   <a className="btn btn-primary" href={Router.path('profile')}>
   <span className="fa-solid fa-gears fa-fw" aria-hidden="true"></span>
   {t('profile.preferenceslink', "Account settings")}
 </a>
:
allowPrivateMessages() && <SendMessage {...sendMessageAttr()}/>
}
       
    </div>
  </div>
  {showSettings ()&&
  <div className="page-component page-component-seperated">
  <div className="row gap-3 mb-3">
    {data.showPrivileges &&     <div className="col-md">
        <h3>
          <span className="fa-solid fa-gear fa-fw" aria-hidden="true"></span>
          {t('privileges.title', 'Edit Privileges')}
        </h3>
        <div className="list-group">
          {data.privileges.admin?
            <li className="list-group-item list-group-item-success">
              {data.alterPrivileges  &&  <button type="button"
                        className="js-remove-privilege-btn btn-close btn-close-white float-end"
                        data-bs-toggle="tooltip"
                        data-bs-title={t('privilege.remove' ,'Remove privilege' )}
                        data-priv="admin">
                </button>}
          
              {t('privilege.has.admin' ,'Administrator privileges granted')}
            </li>
          :
data.alterPrivileges  &&  <button type="button"
className="list-group-item-action list-group-item-secondary btn js-give-admin">
{t('privilege.add.admin', 'Grant administrator privileges')}
</button>
          }
          
        </div>
      </div>
    }
    {showInviteGroups()
    && <div className="col-md">
    <h3>
      <span className="fa-solid fa-gear fa-fw" aria-hidden="true"></span>
      {t('userprofile.groups.header', 'Edit groups')}
    </h3>
    <div className="list-group">
      {data.inviteGroups.map(group =>
groupMember(group, data.user)?
  <li className="list-group-item list-group-item-success">
  <button type="button"
          className="js-group-expel-btn btn-close btn-close-white float-end"
          data-bs-toggle="tooltip"
          data-bs-title={t('profile.group.expel' ,'Expel from group {GROUPNAME}',{ GROUPNAME:group.name})}>
  </button>
  {t('profile.group.member', 'Member of group')}
  <span className="group">{group.name}</span>
</li>

  :
<button type="button"
                  className="js-draft-into-group list-group-item list-group-item-action list-group-item-secondary">
            {t('profile.group.draft', 'Draft into group')}
            {group.name}
          </button>

     ) }

     
    </div>
  </div>
    }
  </div>
</div>
  }
  <CourseList user={data.user} ownProfile={false}/>
{data.alterPrivileges && <>
  <h3 className="text-danger">{t('profile.account.delete.header', 'Is this a spammer?')}
    </h3>
    {verifyUserDelete ?
    <ButtonDelete />
  :
  <div className="border border-danger text-danger p-3">
  <p>{t('profile.account.reallydelete', 'Remove the user profile "{NAME}" permanently? {COURSES, number} Courses created by this user (with {INTERESTED, number} Participants and {EVENTS, number} upcoming events) will also be removed.',{ NAME:data.user.getDisplayName(), COURSES:numberOfCoursesAffectedByDelete, INTERESTED:numberOfInterestedAffectedByDelete, EVENTS:numberOfFutureEventsAffectedByDelete})}
  </p>
  <div className="mb-3">
    <textarea className='form-control js-reason'
              placeholder={t('profile.account.reason.placeholder' ,'Reason for deleting this user')}></textarea>
  </div>
  <div className="form-actions">
    <ButtonDeleteConfirm
    event="js-verify-user-delete-confirm"
    textIdle={t ('profile.account.delete.confirm.button' ,'Delete user and all his traces')}
    textBusy={t('profile.account.delete.confirm.button.busy', 'Deleting profile…')}/>
  
    <ButtonCancel event="js-verify-user-delete-collapse"/>
  </div>
</div>
  }
    </>}
 
</div>
}
