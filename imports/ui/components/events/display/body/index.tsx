import React, { useState } from "react";
import { ReactiveVar } from "meteor/reactive-var";
import { Router } from "meteor/iron:router";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";
import { useTranslation } from "react-i18next";
import { useUser } from "/imports/utils/react-meteor-data";

import * as Alert from "/imports/api/alerts/alert";
import { Courses } from "/imports/api/courses/courses";
import { EventModel } from "/imports/api/events/events";
import * as EventsMethods from "/imports/api/events/methods";
import { Regions } from "/imports/api/regions/regions";

import * as Analytics from "/imports/ui/lib/analytics";
import { PleaseLogin } from "/imports/ui/lib/please-login";

import  { Props as DeleteConfirmDialogProps } from "./delete-confirm-dialog";
import  { CancelConfirmDialog, Props as CancelConfirmDialogProps } from "./cancel-confirm-dialog";
import  { Props as EventReplicationProps } from "../../replication";

import "./template.html";
import "./styles.scss";
import { Content } from "../content";
import { Files } from "../../../courses/files";
import { DeleteConfirmDialog } from "../../../delete-confirm-dialog";

const Template = TemplateAny as TemplateStaticTyped<
  "eventDisplay",
  { event: EventModel; onRemove: () => void },
  {
    replicating: ReactiveVar<boolean>;
    canceling: ReactiveVar<boolean>;
    expanded: ReactiveVar<boolean>;
  }
>;

const template = Template.eventDisplay;

template.onCreated(function () {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const instance = this;
  instance.replicating = new ReactiveVar(false);
  instance.canceling = new ReactiveVar(false);
  instance.expanded = new ReactiveVar(false);
});


template.events({
  "click .js-show-replication"(_event, instance) {
    instance.replicating.set(true);
    instance.expanded.set(false);
  },
  "click .js-cancel"(_event, instance) {
    instance.canceling.set(true);
    instance.expanded.set(false);
  },
  "click .js-expand"(_event, instance) {
    instance.expanded.set(true);
  },

  async "click .js-event-uncancel"(_event, instance) {
    instance.busy("unarchive");
    PleaseLogin(instance, async () => {
      const { event } = instance.data;
      try {
        await EventsMethods.uncancel(event._id);
        Alert.success(
          t(
            "event.details.message.eventHasBeenUncanceled",
            "{EVENT} has been uncaneled. No notifications have been sent.",
            {
              EVENT: event.title,
            },
          ),
        );
      } catch (err) {
        Alert.serverError(
          err,
          t("event.details.message.eventHasBeenUncanceled.error", "Uncancelling went wrong"),
        );
      } finally {
        instance.busy(false);
      }
    });
  },

  "click .js-track-cal-download"(_event, instance) {
    Analytics.trackEvent(
      "Events downloads",
      "Event downloads via event details",
      Regions.findOne(instance.data.event.region)?.nameEn,
    );
  },
});


export function Display( { event , onRemove}: { event: EventModel; onRemove: () => void },){
  const { t } = useTranslation();
const user = useUser()

const [replicating, setReplicating]= useState(false);
    const [canceling, setCanceling]= useState(false);
    const [expanded,setExpanded]= useState(false);

 
function  mayEdit(event: EventModel) {
    if (!user) {
      return false;
    }
    return event.editableBy(user);
  }
function  singleEvent() {
    return Courses.findOne(event.courseId)?.singleEvent;
  }
function   course() {
    return Courses.findOne(event.courseId);
  }
function   isExpanded() {
    return canceling || expanded;
  }
function   cancelConfirmDialogAttr(): CancelConfirmDialogProps {
    return {
      event,
      onCancel: async (reason) => {
        instance.busy("cancel");
        PleaseLogin(instance, async () => {
          try {
            await EventsMethods.cancel(event._id, reason);

            setCanceling(false);
            Alert.success(
              t("event.details.message.eventHasBeenCanceled", "{EVENT} was canceled.", {
                EVENT: event.title,
              }),
            );
          } catch (err) {
            Alert.serverError(
              err,
              t("event.details.message.eventHasBeenCanceled.error", "Cancelling went wrong"),
            );
          } finally {
            instance.busy(false);
          }
        });
      },
      onClose: () => {
        setCanceling(false);
      },
    };
  }
function   deleteConfirmDialogAttr(): DeleteConfirmDialogProps {
    return {
      confirmText: t(
        "event.reallydelete",
        "Please confirm that you would like to delete this event. This might confuse other users and cannot be undone. The event will be permanently deleted and not visible any more.",
      ),
      confirmButton: t("event.delete.confirm.button", "Delete event without notifying anyone"),
      cancelButton: t("event.delete.confirm.cancel.button", "Rather mark as canceled"),
      busyButton: t("event.delete.confirm.button.busy", "Deleting event…"),
      onRemove: async () => {
        const { title, region } = event;
        const course = event.courseId;

        onRemove();
        try {
          await EventsMethods.remove(event._id);

          Alert.success(
            t("eventDetails.eventRemoved", 'The "{TITLE}" event has been deleted.', {
              TITLE: title,
            }),
          );

          Analytics.trackEvent(
            "Event deletions",
            "Event deletions as team",
            Regions.findOne(region)?.nameEn,
          );

          if (course) {
            Router.go("showCourse", { _id: course });
          } else {
            Router.go("/");
          }
        } catch (err) {
          Alert.serverError(err, t("eventDetails.eventRemoved.error", "Could not remove event"));
        }
      },
      onCancel: async () => {
        setExpanded(false);
      },
    };
  }
function  eventReplicationAttr(): EventReplicationProps {
    return {
      event,
      afterSave: async () => {
        setReplicating(false);
        setExpanded(false);
      },
      onCancel: async () => {
        setReplicating(false);
        setExpanded(false);
      },
    };
  }

  return   <div className="page-component">
    {{#if mayEdit event}}
      {{#if singleEvent}}
        <nav>
          <ul className="nav nav-tabs" role="tablist">
            <li className="nav-item" role="presentation">
              <button className="nav-link active" id="description-tab" data-bs-toggle="tab"
                      data-bs-target="#description" type="button" role="tab"
                      aria-controls="description" aria-selected="true">
                <span className="fa-solid fa-file-lines fa-fw" aria-hidden="true"></span>
                <span className="tab-label">{t('course.subnav.descr', 'Description')}</span>
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button className="nav-link" id="files-tab" data-bs-toggle="tab" data-bs-target="#files"
                      type="button" role="tab" aria-controls="files" aria-selected="false">
                <span className="fa-solid fa-file fa-fw" aria-hidden="true"></span>
                <span className="tab-label">{t( 'course.subnav.files', 'Files')}</span>
              </button>
            </li>
          </ul>
        </nav>
        <div className="tab-content border-none">
          <div className="tab-pane mh-none overflow-visible active" id="description" role="tabpanel"
               aria-labelledby="description-tab" tabIndex={0}>
            <Content event={event}/>
          </div>
          <div className="tab-pane mh-none" id="files" role="tabpanel" aria-labelledby="files-tab"
               tabIndex={0}>
            <div className="p-3">
              <Files course={course()}/>
            </div>
          </div>
        </div>
      {{else}}
       <Content event={event}/>
      {{/if}}
    {{else}}
     <Content event={event}/>
    {{/if}}
    {{#if replicating}}
      {{> eventReplication eventReplicationAttr}}
    {{else}}
      {{#if (mayEdit event)}}
        <div className="actions">
          {{#unless isExpanded}}
            {{> buttonEdit event="js-event-edit"}}
            <button type="button" className="btn btn-edit js-show-replication">
              {t('event.details.repl_menu_btn', 'Repeat')}
            </button>
            <a className="btn btn-edit js-download js-track-cal-download"
               href="{{pathFor 'calEvent' event}}"
               title={t( 'event.detail.download_cal', 'Download event to my calendar' )}>
              {t('event.details.download', 'Download')}
            </a>
            {{#unless event.canceled}}
              <button type="button" className="btn btn-remove js-cancel">
                {t('event.details.cancel', 'Cancel this event')}
              </button>
            {{else}}
              <button type="button" className="btn btn-edit js-event-uncancel">
                {t('event.details.uncancel', 'Uncancel this event')}
              </button>
            {{/unless}}
            {{> buttonDelete event="js-expand"}}
          {{/unless}}
        </div>
        {{#if instance.expanded.get}}
          <DeleteConfirmDialog {...deleteConfirmDialogAttr()}/>
        {{/if}}
        {{#if instance.canceling.get}}
          <CancelConfirmDialog {...cancelConfirmDialogAttr()}/>
        {{/if}}
      {{/if}}
    {{/if}}
  </div>
}
