import React, { useEffect } from "react";
import { Template } from "meteor/templating";
import { useParams } from "/imports/ui/hooks/react-meteor-router";
import ReactMarkdown from "react-markdown";
import $ from "jquery";

import { InfoPagesEntity } from "/imports/api/infoPages/infoPages";

import { routerAutoscroll } from "/imports/ui/lib/router-autoscroll";
import { ScssVars } from "/imports/ui/lib/scss-vars";
import { MeteorAsync } from "/imports/utils/promisify";
import { MetaTags } from "/imports/ui/components/MetaTags";

import "./styles.scss";

export interface Props {
  page: Pick<InfoPagesEntity, "title" | "body">;
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
      targetTitle.addClass("active");
      $(window).scrollTop(targetTitle.position().top - ScssVars.navbarHeight);
    }
  }

  useEffect(() => {
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

    function handleClick(
      event: JQuery.ClickEvent<HTMLElement, undefined, HTMLElement, HTMLElement>,
    ) {
      const title = $(event.currentTarget);
      title.nextUntil(headerTag, contentTags).toggle();
      title.toggleClass("active");
      history.pushState(null, "", `#${title.attr("id")}`);
    }

    const element = $(headerTag);
    element.on("click", handleClick);
    return () => {
      element.off("click", handleClick);
    };
  });

  return (
    <>
      <MetaTags title={page.title} />

      <div className="container mw-md info-page">
        <ReactMarkdown linkTarget="_blank" skipHtml>
          {page.body}
        </ReactMarkdown>
      </div>
    </>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("InfoPage", () => InfoPage);
