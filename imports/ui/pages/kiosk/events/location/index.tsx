import React, { useState } from "react";
import { Router } from "meteor/iron:router";

import "./template.html";

const Template = TemplateAny as TemplateStaticTyped<"kioskEventLocation">;
const template = Template.kioskEventLocation;
template.helpers({
  ,
});


export function Location(){

  function showLocation() {
    // The location is shown when we have a location name and the location is not used as a filter
    return this.location?.name && !Router.current().params.query.location;
  }


return <div class="kiosk-event-location">

  {{#if showLocation}}
    <span class="fa-solid fa-house fa-fw" aria-hidden="true"></span>
    {{location.name}}
    {{#if room}} - {{/if}}
  {{/if}}
  {{#if room}}
    {{#unless showLocation}}
      <span class="fa-solid fa-signs-post fa-fw" aria-hidden="true"></span>
    {{/unless}}
    {{room}}
  {{/if}}
</div>
}
