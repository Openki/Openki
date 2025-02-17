import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";
import moment from "moment";

import * as TemplateMixins from "/imports/ui/lib/template-mixins";

import "./template.html";
import "./styles.scss";

const Template = TemplateAny as TemplateStaticTyped<"logEntry">;

const template = TemplateMixins.MultiExpandible(Template, "logEntry");

template.helpers({
  shortId(id: string) {
    return id.substring(0, 8);
  },
  isodate(date: moment.Moment) {
    return moment(date).toISOString();
  },
  jsonBody() {
    return JSON.stringify(this.body, null, "   ");
  },
  jsonFull() {
    return JSON.stringify(this, null, "   ");
  },
});


export function Entry(){
  return  <tr>
  {{#if interval}}
    <td></td>
    <td></td>
    <td colspan="3" style="color: gray">{{interval}}</td>
  {{else}}
    <td>{{#with _id}}<a class="js-rel-id id clickable"
           title="{{this}}">{{shortId this}}</a>{{/with}}
    </td>
    <td>{{#with tr}}<a class="js-tr id clickable">{{this}}</a>{{/with}}</td>
    <td>{{#with ts}}<a class="js-date clickable nowrap">{{isodate this}}</a>{{/with}}</td>
    <td class="nowrap">
      {{#each rel}}
        <a class="js-rel-id id clickable nowrap" title="{{this}}">{{shortId this}}</a>
      {{/each}}
    </td>
    <td>
      {{#if expanded}}
        <pre class="js-collapse">{{jsonFull}}</pre>
      {{else}}
        <div class="js-expand nowrap">{{jsonBody}}</div>
      {{/if}}
    </td>
  {{/if}}
</tr>
}
