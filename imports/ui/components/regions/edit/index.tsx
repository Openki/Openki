import { i18n } from "/imports/startup/both/i18next";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";

import { Geodata, RegionEntity } from "/imports/api/regions/regions";
import * as Alert from "/imports/api/alerts/alert";

import { LocationTracker } from "/imports/ui/lib/location-tracker";
import { PleaseLogin } from "/imports/ui/lib/please-login";

import "/imports/ui/components/buttons";
import "/imports/ui/components/editable";
import "/imports/ui/components/map";
import "./fields";

import "./template.html";
import "./styles.scss";

export interface Data {
  region: RegionEntity;
  title: string;
  onSave: (changes: OnSaveFields) => Promise<void>;
  onCancel: () => void;
}

export interface OnSaveFields {
  name: string;
  tz: string;
  description: string;
  loc: Geodata;
}

const Template = TemplateAny as TemplateStaticTyped<
  "regionEdit",
  Data,
  { locationTracker: LocationTracker }
>;

const template = Template.regionEdit;

template.onCreated(function () {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const instance = this;
  instance.busy(false);

  instance.locationTracker = new LocationTracker();
});

template.helpers({
  locationTracker() {
    return Template.instance().locationTracker;
  },
});

template.events({
  submit(event, instance) {
    event.preventDefault();

    const changes = {
      name: instance.$(".js-name").val(),
      tz: instance.$(".js-timezone").val(),
      description: instance.$(".js-description").val(),
    } as OnSaveFields;

    if (!changes.name) {
      Alert.error(i18n("region.create.plsGiveName", "Please give your region a name"));
      return;
    }

    const loc = instance.locationTracker.getLocation();
    if (loc) {
      changes.loc = loc;
    } else {
      Alert.error(
        i18n(
          "region.create.plsSelectPointOnMap",
          'Please add a marker on the map by clicking on the "+" sign.',
        ),
      );
      return;
    }

    instance.busy("saving");
    PleaseLogin(instance, async () => {
      try {
        await instance.data.onSave(changes); // from the parent component

        Alert.success(
          i18n("region.saving.success", 'Saved changes to region "{NAME}".', {
            NAME: changes.name,
          }),
        );
      } catch (err) {
        Alert.serverError(err, i18n("region.saving.error", "Saving the region went wrong"));
      } finally {
        instance.busy(false);
      }
    });
  },

  "click .js-edit-cancel"(_event, instance) {
    instance.data.onCancel(); // from the parent component
  },
});
