import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";

import { RegionModel } from "/imports/api/regions/regions";

import * as StringTools from "/imports/utils/string-tools";

export function Item(){

 function regionNameMarked(this: RegionModel) {
    const search = (Template.instance().parentInstance() as any).state.get("search");
    return StringTools.markedName(search, this.name);
  }
  
 function private() {
    return this.isPrivate() ? "region-link-private" : "";
  }

  return <li className="{{private}}">
  <a href="#"
     className="dropdown-item js-region-link js-nav-dropdown-close {{#if isCurrentRegion _id}}fw-bold{{/if}}"
     title="{{nameEn}}">
    <div className="dropdown-addon-right">
      <span className="badge bg-primary rounded-pill"
            title="{{i18n 'regions.courses.title' '{COUNT, plural, =0{no courses} one{one course} other{# courses in} } in {REGION}' COUNT=courseCount REGION=this.name attr=true}}">
        {{courseCount}}
      </span>
      <span className="badge bg-success text-dark rounded-pill"
            title="{{i18n 'regions.eventCount.title' '{COUNT, plural, =0{no upcoming events} one{one upcoming event} other{# upcoming events} } in {REGION}' COUNT=futureEventCount REGION=this.name attr=true}}">
        {{futureEventCount}}
      </span>
    </div>
    {{#if isCurrentRegion _id}}
      <span className="checkmark fa-solid fa-check"></span>
    {{/if}}
    {{regionNameMarked}}
  </a>
</li>
}

