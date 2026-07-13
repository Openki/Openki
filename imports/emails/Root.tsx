import React, { ReactNode } from "react";
import { PublicSettings } from "/imports/utils/PublicSettings";
import { ICalCalendarMethod } from "ical-generator";

export interface Props {
  subject: string | undefined;
  logo: string;
  customSiteUrl?: string | undefined;
  customSiteName?: string | undefined;
  icalEvent?: {
    method: ICalCalendarMethod | undefined;
    filename: string;
    content: string;
  };
}

export function Root({
  subject,
  logo,
  customSiteUrl,
  customSiteName,
  children,
}: Props & { children: ReactNode }) {
  const brand = PublicSettings.theme.brand;
  const url = customSiteUrl || Meteor.absoluteUrl();
  const name = customSiteName || Accounts.emailTemplates.siteName;

  return (
    <>
      <head>
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{subject}</title>
        {/* Add some styling for emails. For best practice we compile it inline with juice(...). */}
        <style type="text/css">{`
          body {
            background-color: #f0f3f4;
            font-size: 16px;
          }

          table {
            border: 0;
            border-spacing: 0;
            margin-left: auto;
            margin-right: auto;
          }

          td {
            font-family: Source Sans Pro, sans-serif;
            font-size: 12px;
            vertical-align: top;
            margin: 0;
          }

          td {
            border-collapse: collapse;
            /* Handling long words and urls */
            hyphens: auto;
            overflow-wrap: break-word;
            word-break: break-all;
            word-break: break-word;
            word-wrap: break-word;
          }

          .container {
            background-color: #fff;
            box-shadow: 1px 3px 14px 7px #c5cccd;
            max-width: 500px;
          }

          .container > tr > td {
            padding: 0 20px;
          }

          .container > tr:first-child > td,
          .container > tr:last-child > td {
            padding: 0;
          }

          .container > tr:nth-child(2) > td {
            padding-top: 20px;
          }

          .container > tr:nth-last-child(2) > td {
            padding-bottom: 20px;
          }

          .header {
            width: 100%;
          }

          .header tr {
            background-color: ${brand};
          }

          .header td {
            vertical-align: middle;
          }

          .alert > td {
            background: #eee;
            padding-bottom: 20px !important;
          }

          .alert + tr > td {
            padding-top: 20px;
          }

          .logo-wrapper {
            padding: 0 6px 0 20px;
            vertical-align: top;
            width: 1%;
          }

          .logo {
            border: 0;
            display: block;
            height: 45px;
            max-width: 90px;
            outline: none;
            text-decoration: none;
          }

          .site-name-wrapper {
            font-size: 22px;
            font-weight: lighter;
          }

          .site-name {
            color: #fff !important;
            text-decoration: none !important;
            vertical-align: sub;
          }

          .title {
            font-size: 16px;
            font-weight: bold;
            margin: 0;
          }

          .fw-bold {
            font-weight: bold;
          }

          p,
          .p {
            margin: 1em 0;
          }

          code,
          .code {
            font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
          }

          .gap-md {
            margin-top: 2em;
          }

          .gap-lg {
            margin-top: 4em;
          }

          .text-center {
            text-align: center;
          }

          .text-body-secondary {
            color: #666;
          }

          .comment-box {
            margin: 1em auto;
            width: 92%;
          }

          .comment-box td {
            background-color: #ddd;
            color: #333;
            padding: 15px;
          }

          .comment-box .title {
            font-size: 14px;
          }

          .pre {
            white-space: pre-wrap;
          }

          .event {
            margin: 2em auto;
            width: 92%;
          }

          .event-header {
            background-color: #c1f2ae;
            padding: 15px;
          }

          .event-header a {
            color: #333 !important;
            text-decoration: none !important;
          }

          .event-gap {
            height: 2px;
            font-size: 2px;
          }

          .event-body {
            background-color: #e9fae3;
            padding: 15px;
          }

          .event-body .title {
            font-size: 14px;
          }

          .event-canceled {
            background-color: #ff5252;
            padding: 15px;
          }

          .event-link {
            width: 350px;
            padding: 5px;
            text-align: right;
          }

          .event-link a {
            color: #00f !important;
            text-decoration: none !important;
          }

          .button {
            background-color: #3f819e;
            border-radius: 5px;
            color: #fff !important;
            display: inline-block;
            font-size: 14px;
            border-top: 12px solid #3f819e;
            border-right: 18px solid #3f819e;
            border-bottom: 12px solid #3f819e;
            border-left: 18px solid #3f819e;
            text-decoration: none;
          }

          .event-confirmation-email-button {
            float: right;
          }

          .footer {
            border-top: solid 1px ${brand};
            color: #666;
            text-align: center;
            width: 100%;
          }

          .footer td {
            font-size: 10px;
            padding: 0 15px;
          }

          .footer tr:first-child td {
            padding-top: 5px;
          }

          .footer tr:last-child td {
            padding-bottom: 5px;
          }

          .footer a {
            color: #666 !important;
            text-decoration: underline;
          }
`}</style>
      </head>

      <body>
        <table className="container">
          <tr>
            <td>
              <table className="header">
                <tr>
                  <td className="logo-wrapper">
                    <a href={url}>
                      <img className="logo" src={logo} />
                    </a>
                  </td>
                  <td className="site-name-wrapper">
                    <a className="site-name" href={url}>
                      {name}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          {children}
        </table>
      </body>
    </>
  );
}
