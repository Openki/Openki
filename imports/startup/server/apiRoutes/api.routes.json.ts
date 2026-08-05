import { Router } from "meteor/iron:router";
import { WebApp } from "meteor/webapp";
import type { ServerResponse } from "node:http";

import { FilteringReadError } from "/imports/utils/filtering";
import { NoActionError, orderedResults } from "./api.routes.utils";
import { ApiEvent } from "/imports/Api";

WebApp.handlers.use("/api", (_req, response, next) => {
  // We need this because there is an error in the Types of meteor. This may be removed in future.
  const res = response as unknown as ServerResponse;

  res.setHeader("Access-Control-Allow-Origin", "*");
  return next();
});

const jsonSendResponder = async function (res: any, process: () => Promise<ApiEvent[]>) {
  try {
    const body = {
      status: "success",
      data: await process(),
    };
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify(body, null, "\t"));
  } catch (e) {
    const body: any = {};
    if (e instanceof FilteringReadError || e instanceof NoActionError) {
      res.statusCode = 400;
      body.status = "fail";
      body.data = {};
      if ((e as any).name) {
        body.data[(e as any).name] = e.message;
      } else {
        body.data.error = e.message;
      }
    } else {
      console.log(e, e.stack);
      res.statusCode = 500;
      body.status = "error";
      body.message = "Server error";
    }
    res.end(JSON.stringify(body, null, "\t"));
  }
};

Router.route("api.0.json", {
  path: "/api/0/json/:handler",
  where: "server",
  async action() {
    await jsonSendResponder(this.response, () => orderedResults(this.params, this.params.handler));
  },
});
