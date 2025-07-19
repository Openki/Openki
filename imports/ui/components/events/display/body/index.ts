import { ReactiveVar } from "meteor/reactive-var";
import { Router } from "meteor/iron:router";
import { i18n } from "/imports/startup/both/i18next";
import { Meteor } from "meteor/meteor";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";

import * as Alert from "/imports/api/alerts/alert";
import { Courses } from "/imports/api/courses/courses";
import { EventModel } from "/imports/api/events/events";
import * as EventsMethods from "/imports/api/events/methods";
import { Regions } from "/imports/api/regions/regions";

import * as Analytics from "/imports/ui/lib/analytics";
import { PleaseLogin } from "/imports/ui/lib/please-login";

import "/imports/ui/components/courses/files";
import "/imports/ui/components/buttons";
import "/imports/ui/components/courses/categories";
import "/imports/ui/components/events/display/course-header";
import "/imports/ui/components/events/display/header";
import "/imports/ui/components/events/edit";
import "/imports/ui/components/events/participants";
import "/imports/ui/components/events/replication";
import "/imports/ui/components/events/display/content";
import "/imports/ui/components/events/display/group-list";
import "/imports/ui/components/groups/tag";
import "/imports/ui/components/price-policy";
import "/imports/ui/components/regions/tag";
import "/imports/ui/components/sharing";
import "/imports/ui/components/report";
import "/imports/ui/components/venues/link";
import "/imports/ui/components/internal-indicator";
import "./delete-confirm-dialog";
import "./cancel-confirm-dialog";
import type { Props as DeleteConfirmDialogProps } from "./delete-confirm-dialog";
import type { Props as CancelConfirmDialogProps } from "./cancel-confirm-dialog";
import type { Props as EventReplicationProps } from "../../replication";

import "./template.html";
import "./styles.scss";

{
  const Template = TemplateAny as TemplateStaticTyped<
    "eventDisplay",
    { event: EventModel },
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

  template.helpers({
    mayEdit(event: EventModel) {
      const user = Meteor.user();
      if (!user) {
        return false;
      }
      return event.editableBy(user);
    },
    replicating() {
      return Template.instance().replicating.get();
    },
    singleEvent() {
      return Courses.findOne(Template.instance().data.event.courseId)?.singleEvent;
    },
    course() {
      return Courses.findOne(Template.instance().data.event.courseId);
    },
    isExpanded() {
      return Template.instance().canceling.get() || Template.instance().expanded.get();
    },
    cancelConfirmDialogAttr(): CancelConfirmDialogProps {
      const instance = Template.instance();
      return {
        event: instance.data.event,
        onCancel: async (reason) => {
          instance.busy("cancel");
          PleaseLogin(instance, async () => {
            const { event } = instance.data;
            try {
              await EventsMethods.cancel(event._id, reason);

              instance.canceling.set(false);
              Alert.success(
                i18n("event.details.message.eventHasBeenCanceled", "{EVENT} was canceled.", {
                  EVENT: event.title,
                }),
              );
            } catch (err) {
              Alert.serverError(
                err,
                i18n("event.details.message.eventHasBeenCanceled.error", "Cancelling went wrong"),
              );
            } finally {
              instance.busy(false);
            }
          });
        },
        onClose: () => {
          instance.canceling.set(false);
        },
      };
    },
    deleteConfirmDialogAttr(): DeleteConfirmDialogProps {
      const instance = Template.instance();
      return {
        confirmText: i18n(
          "event.reallydelete",
          "Please confirm that you would like to delete this event. This might confuse other users and cannot be undone. The event will be permanently deleted and not visible any more.",
        ),
        confirmButton: i18n("event.delete.confirm.button", "Delete event without notifying anyone"),
        cancelButton: i18n("event.delete.confirm.cancel.button", "Rather mark as canceled"),
        busyButton: i18n("event.delete.confirm.button.busy", "Deleting event…"),
        onRemove: async () => {
          const oEvent = instance.data.event;
          const { title, region } = oEvent;
          const course = oEvent.courseId;

          (instance.parentInstance() as any).editing.set(false);
          try {
            await EventsMethods.remove(oEvent._id);

            Alert.success(
              i18n("eventDetails.eventRemoved", 'The "{TITLE}" event has been deleted.', {
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
            Alert.serverError(
              err,
              i18n("eventDetails.eventRemoved.error", "Could not remove event"),
            );
          }
        },
        onCancel: async () => {
          instance.expanded.set(false);
        },
      };
    },
    eventReplicationAttr(): EventReplicationProps {
      const instance = Template.instance();
      return {
        event: instance.data.event,
        afterSave: async () => {
          instance.replicating.set(false);
          instance.expanded.set(false);
        },
        onCancel: async () => {
          instance.replicating.set(false);
          instance.expanded.set(false);
        },
      };
    },
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
            i18n(
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
            i18n("event.details.message.eventHasBeenUncanceled.error", "Uncancelling went wrong"),
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
}
