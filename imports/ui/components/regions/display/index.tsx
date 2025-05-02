import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { i18n } from "/imports/startup/both/i18next";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";
import { ReactiveDict } from "meteor/reactive-dict";

import * as Alert from "/imports/api/alerts/alert";
import { RegionModel } from "/imports/api/regions/regions";

import "/imports/ui/components/map";
import type { LocEntity, MarkerEntity } from "/imports/ui/components/map";
import "/imports/ui/components/delete-confirm-dialog";
import type { Props as DeleteConfirmDialogProps } from "/imports/ui/components/delete-confirm-dialog";

import "./template.html";
import "./styles.scss";

export interface Data {
  region: RegionModel;
  onEdit: () => void;
  onDelete: () => Promise<void>;
}

const Template = TemplateAny as TemplateStaticTyped<
  "regionDisplay",
  Data,
  {
    state: ReactiveDict<{ verifyDelete: boolean }>;
    markers: Mongo.Collection<MarkerEntity>;
    setLocation: (loc?: LocEntity) => void;
  }
>;

const template = Template.regionDisplay;

template.onCreated(function () {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const instance = this;
  instance.busy(true);

  instance.state = new ReactiveDict(undefined, {
    verifyDelete: false,
  });

  const markers = new Mongo.Collection<MarkerEntity>(null); // Local collection for in-memory storage
  instance.markers = markers;

  instance.setLocation = (loc) => {
    markers.remove({ main: true });
    if (!loc) {
      return;
    }
    markers.insert({ loc, main: true });
  };
});

template.onRendered(function () {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const instance = this;

  instance.busy(false);

  instance.autorun(() => {
    const { region } = Template.currentData();

    instance.setLocation(region.loc);
  });
});

template.helpers({
  mayEdit() {
    const { region } = Template.instance().data;

    return region.editableBy(Meteor.user());
  },
  deleteConfirmDialogAttr(): DeleteConfirmDialogProps {
    const instance = Template.instance();
    return {
      confirmText: i18n(
        "region.reallydelete",
        "Please confirm that you would like to delete this region with all courses, events and venues. This cannot be undone.",
      ),
      confirmButton: i18n("region.detail.remove", "Remove this region"),
      busyButton: i18n("region.detail.remove.busy", "Deleting region…"),
      onCancel: async () => {
        instance.state.set("verifyDelete", false);
      },
      onRemove: async () => {
        const { region } = instance.data;
        instance.busy("deleting");
        try {
          await instance.data.onDelete();

          Alert.success(i18n("region.removed", 'Removed region "{NAME}".', { NAME: region.name }));
        } catch (err) {
          Alert.serverError(err, i18n("region.deleting.error", "Deleting the region went wrong"));
        } finally {
          instance.busy(false);
        }
      },
    };
  },
});

template.events({
  "click .js-region-edit"(_event, instance) {
    instance.state.set("verifyDelete", false);
    instance.data.onEdit();
  },

  "click .js-region-delete"(_event, instance) {
    instance.state.set("verifyDelete", true);
  },
});
