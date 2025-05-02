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


export function Display(){

  return   <div class="page-component">
  <div class="details-header region-details-header">
    <h3>{{this.region.name}}</h3>
  </div>

  <div class="details-body region-details-body">
    <div class="details-content">
      <div class="row">
        <div class="{{#if region.loc}}col-md-7{{else}}col{{/if}}">
          {{#if this.region.tz}}
            <p>
              <span class="region-property-title">
                {{i18n 'regionDetails.timezone' 'Timezone:'}}
              </span>
              {{this.region.tz}}
            </p>
          {{/if}}
          {{#if this.region.description}}
            <div>
              <div class="region-property-title">
                {{i18n 'tenant.details.regions.description'}}:
              </div>
              <div class="text-break">
                {{this.region.description}}
              </div>
            </div>
          {{/if}}
        </div>
        {{#if this.region.loc}}
          <div class="col-md-5">
            <div class="details-map">
              {{> map markers=instance.markers maxZoom=16}}
              <div class="coordinates">
                <a href="{{geoLocationLink this.region.loc}}">
                  {{i18n 'regionDetails.coordinates' 'Coordinates:'}}
                  {{locationFormat this.region.loc}}
                </a>
              </div>
            </div>
          </div>
        {{/if}}
      </div>
    </div>
  </div>
  {{#if mayEdit}}
    <div class="actions">
      {{> buttonEdit event="js-region-edit"}}
      {{#unless (state 'verifyDelete')}}
        {{> buttonDelete event="js-region-delete"}}
      {{/unless}}
    </div>
    {{#if (state 'verifyDelete')}}
      {{> deleteConfirmDialog deleteConfirmDialogAttr}}
    {{/if}}
  {{/if}}
</div>
}
