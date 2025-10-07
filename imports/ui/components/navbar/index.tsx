import { Meteor } from "meteor/meteor";
import { Router } from "meteor/iron:router";
import { ReactiveDict } from "meteor/reactive-dict";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";
import $ from "jquery";

import { Regions } from "/imports/api/regions/regions";

import { ScssVars } from "/imports/ui/lib/scss-vars";
import * as Viewport from "/imports/ui/lib/viewport";
import { PublicSettings } from "/imports/utils/PublicSettings";
import { i18n } from "/imports/startup/both/i18next";
import { getSiteName } from "/imports/utils/getSiteName";

import "/imports/ui/components/regions/selection/wrap";
import "/imports/ui/components/language-selection";
import "./test-warning-ticker";
import "./user-frame";
import "./login-button";

import "./template.html";
import "./styles.scss";

const Template = TemplateAny as TemplateStaticTyped<
  "navbar",
  unknown,
  {
    state: ReactiveDict<{
      navbarIsCollapsed: boolean;
    }>;
  }
>;

const template = Template.navbar;

template.onCreated(function () {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const instance = this;
  instance.state = new ReactiveDict();
  instance.state.setDefault({
    navbarIsCollapsed: true,
  });
});

template.onRendered(function () {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const instance = this;
  const { gridFloatBreakpoint } = ScssVars;

  // if not collapsed give the navbar and active menu item a
  // class for when not at top
  if (Viewport.get().width > gridFloatBreakpoint) {
    const navbar = instance.$(".navbar");
    const activeNavLink = instance.$(".navbar-link.active");

    navbar.addClass("navbar-covering");
    activeNavLink.addClass("navbar-link-covering");
  } else {
    $(document).on("click", (event) => {
      if (instance.$(event.target as any).parents(".navbar-collapse").length === 0) {
        instance.$(".navbar-collapse").collapse("hide");
      }
    });
  }

  // closing the navbar when screen is made larger
  $(window).on("resize", () => {
    if (Viewport.get().width > ScssVars.gridFloatBreakpoint) {
      // this closes the navbar via jquery, which triggers an event that will
      // change the (blaze) state and close the modal as well
      instance.$(".navbar-collapse").collapse("hide");
    }
  });
});

template.helpers({
  connected() {
    return Meteor.status().status === "connected";
  },

  connecting() {
    return Meteor.status().status === "connecting";
  },

  headerLogo() {
    let headerLogo;

    const currentRegion = Regions.currentRegion();
    if (currentRegion?.custom?.headerLogo?.src) {
      // the region has a custom logo
      headerLogo = currentRegion.custom.headerLogo.src;
    } else {
      // general logo
      headerLogo = PublicSettings.headerLogo.src;
    }

    if (headerLogo.startsWith("data:image/")) {
      // base64 image
      return headerLogo;
    }

    if (headerLogo.startsWith(PublicSettings.s3.publicUrlBase)) {
      // in our s3 file storage
      return headerLogo;
    }

    // in the openki repository folder "public/logo/"
    return `/logo/${headerLogo}`;
  },

  headerAlt() {
    const currentRegion = Regions.currentRegion();
    if (currentRegion?.custom?.headerLogo?.alt) {
      return currentRegion.custom.headerLogo.alt;
    }

    return PublicSettings.headerLogo.alt;
  },

  notConnected() {
    return Meteor.status().status !== "connecting" && Meteor.status().status !== "connected";
  },

  siteStage() {
    const currentRegion = Regions.currentRegion();
    if (currentRegion?.custom?.siteStage) {
      return currentRegion.custom.siteStage;
    }

    return PublicSettings.siteStage;
  },

  links() {
    const siteName = getSiteName(Regions.currentRegion());

    return PublicSettings.nav.customEntries.map((entry) => ({
      link: entry.link,
      icon: entry.icon,
      text: entry.key ? i18n(entry.key, { SITENAME: siteName }) : entry.text,
    }));
  },

  activeClass(linkRoute: string, id: string) {
    const router = Router.current();
    if (router.route?.getName() === linkRoute) {
      if (typeof id === "string" && router.params._id !== id) {
        return "";
      }
      return "active";
    }
    return "";
  },

  navbarIsCollapsed() {
    return Template.instance().state.get("navbarIsCollapsed");
  },
});

template.events({
  "show.bs.collapse .navbar"() {
    Template.instance().state.set("navbarIsCollapsed", false);
  },

  "hide.bs.collapse .navbar"() {
    Template.instance().state.set("navbarIsCollapsed", true);
  },

  "click .js-nav-dropdown-close"() {
    Template.instance().$(".navbar-collapse").collapse("hide");
  },

  "show.bs.dropdown, hide.bs.dropdown .dropdown"(event, instance) {
    const { gridFloatBreakpoint } = ScssVars;

    if (Viewport.get().width <= gridFloatBreakpoint) {
      const container = instance.$("#bs-navbar-collapse");

      // make menu item scroll up when opening the dropdown menu
      if (event.type === "show") {
        const scrollTo = $(event.currentTarget);
        if (scrollTo && container) {
          const scrollToOffset = scrollTo.offset();
          const containerOffset = container.offset();
          const containerScrollTop = container.scrollTop();

          if (
            scrollToOffset === undefined ||
            containerOffset === undefined ||
            containerScrollTop === undefined
          ) {
            throw new Error("Unexpected undefined");
          }

          container.animate({
            scrollTop: scrollToOffset.top - containerOffset.top + containerScrollTop,
          });
        }
      } else {
        container.scrollTop(0);
      }
    }
  },
});


export function Navbar(){
  return <nav class="navbar navbar-expand-lg fixed-top bg-brand" data-bs-theme="dark">
    {{#if PublicSettings.testWarning}}
      {{> testWarningTicker}}
    {{/if}}
    {{! Brand and toggle get grouped for better mobile display }}
    <div class="navbar-container container-fluid">
      <a class="navbar-brand js-toggle-introduction me-4" href="{{PublicSettings.nav.brandLink}}">
        {{#if connecting}}
          <span class="fa-solid fa-circle-notch fa-spin fa-fw connecting"
                title="{{i18n 'status.connecting' 'Connecting to server' attr=true}}">
          </span>
          <span class="sr-only">{{i18n 'status.connecting'}}</span>
        {{/if}}
        {{#if notConnected}}
          <span class="fa-solid fa-circle-notch fa-fw no-connection"
                title="{{i18n 'status.notConnected' 'No connection to server' attr=true}}">
          </span>
          <span class="sr-only">{{i18n 'status.notConnected'}}</span>
        {{/if}}
        {{#if connected}}
          <img src="{{headerLogo}}" alt="{{headerAlt}}">
        {{/if}}
        <span class="site-name">{{siteName}}</span>
        <span class="site-stage">{{siteStage}}</span>
      </a>
      <button class="navbar-toggler collapsed" type="button" data-bs-toggle="collapse"
              data-bs-target="#bs-navbar-collapse" aria-controls="bs-navbar-collapse"
              aria-expanded="false" aria-label="Toggle navigation">
        <i class="fa-solid fa-bars text-white"></i>
        <i class="fa-solid fa-x text-white"></i>
      </button>
      <div class="collapse navbar-collapse" id="bs-navbar-collapse">
        <ul class="navbar-nav flex-row me-auto mb-lg-0">
          {{#if PublicSettings.nav.search}}
            <li class="nav-item text-center col col-lg-auto">
              <a href="{{pathFor 'search'}}"
                 class="{{activeClass 'search'}} {{activeClass 'showCourse'}} nav-link js-nav-dropdown-close"
                 id="nav_courses">
                <span class="fa-regular fa-lightbulb fa-fw" aria-hidden="true"></span>
                {{i18n 'menue.Courses' 'Find'}}
                <div class="nav-marker-caret"></div>
              </a>
            </li>
          {{/if}}
          {{#if PublicSettings.nav.proposeCourse}}
            <li class="nav-item text-center col col-lg-auto">
              <a href="{{pathFor 'proposeCourse'}}"
                 class="{{activeClass 'proposeCourse'}} {{activeClass 'showEvent' 'create'}} nav-link js-nav-dropdown-close">
                <span class="fa-solid fa-pencil fa-fw" aria-hidden="true"></span>
                {{i18n 'menue.Create' 'Create'}}
                <div class="nav-marker-caret"></div>
              </a>
            </li>
          {{/if}}
          {{#if PublicSettings.nav.calendar}}
            <li class="nav-item text-center col col-lg-auto">
              <a href="{{pathFor 'calendar'}}"
                 class="{{activeClass 'calendar'}} nav-link calendar-link js-nav-dropdown-close">
                <span class="fa-regular fa-calendar-days fa-fw" aria-hidden="true"></span>
                {{i18n 'menue.Calendar' 'Calendar'}}
                <div class="nav-marker-caret"></div>
                <div class="nav-marker-bar"></div>
              </a>
            </li>
          {{/if}}
          {{#each links}}
            <li class="nav-item text-center col col-lg-auto">
              <a href="{{link}}" class="nav-link js-nav-dropdown-close">
                <span class="{{icon}} fa-fw" aria-hidden="true"></span>
                {{text}}
              </a>
            </li>
          {{/each}}
        </ul>
        <ul class="navbar-nav flex-row" data-bs-theme="light">
          {{> regionSelectionWrap inNavbar=true}}
          {{> languageSelectionWrap inNavbar=true}}
        </ul>
        <ul class="navbar-nav text-center" data-bs-theme="light">
          <li class="dropdown login-link">
            {{> loginButton}}
            <div class="dropdown-menu dropdown-menu-end login-dropdown">
              {{> userFrame}}
            </div>
          </li>
        </ul>
      </div>
    </div>
  </nav>
  <div class="navbar-custom-modal {{#if navbarIsCollapsed}}d-none{{/if}} js-nav-dropdown-close">
  </div>
}