import React, { useEffect } from "react";
import { Template } from "meteor/templating";
import { useParams } from "/imports/utils/react-meteor-router";
import ReactMarkdown from "react-markdown";
import $ from "jquery";

import { InfoPagesEntity } from "/imports/api/infoPages/infoPages";

import { routerAutoscroll } from "/imports/ui/lib/router-autoscroll";
import { ScssVars } from "/imports/ui/lib/scss-vars";
import { MeteorAsync } from "/imports/utils/promisify";
import * as Metatags from "/imports/utils/metatags";

import "./styles.scss";

export interface Props {
  page: InfoPagesEntity;
}

export function InfoPage({ page }: Props) {
  const headerTag = "h2, h3";
  const contentTags = "p, ul";
  const params = useParams();

  routerAutoscroll.cancelNext();

  async function scrollTo(id: string) {
    const idSelector = `#${decodeURIComponent(id)}`;
    const targetTitle = $(idSelector);
    if (targetTitle.length) {
      await MeteorAsync.defer();

      targetTitle.nextUntil(headerTag).show();
      $(window).scrollTop(targetTitle.position().top - ScssVars.navbarHeight);
    }
  }

  useEffect(() => {
    if (page) {
      Metatags.setCommonTags(page.title);
    }

    // in order to create nice IDs for the questions also for non-english
    // alphabets we make our own ones
    $(headerTag).each((_index, element) => {
      const title = $(element);
      const id = title
        .text()
        .trim()
        .toLowerCase()
        .replace(/[_+.,!?@#$%^&*();\\/|<>"'=]/g, "")
        .replace(/[ ]/g, "-");

      title.attr("id", id);
    });

    const { hash } = params;
    if (hash) {
      scrollTo(hash);
    }

    $('a[href^="#"]').attr("target", "");

    $(headerTag).on("click", function (event) {
      const title = $(event.currentTarget);
      title.nextUntil(headerTag, contentTags).toggle();
      title.toggleClass("active");
    });
  });

  return (
    <div className="container mw-md info-page">
      <ReactMarkdown linkTarget="_blank" skipHtml={true}>
        {page.body}
      </ReactMarkdown>
    </div>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("InfoPage", () => InfoPage);
