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
