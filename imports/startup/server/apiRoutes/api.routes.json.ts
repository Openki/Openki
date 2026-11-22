import { Router } from "meteor/iron:router";
import { WebApp } from "meteor/webapp";
import type { Response } from "express";

import { FilteringReadError } from "/imports/utils/filtering";
import { NoActionError, orderedResults } from "./api.routes.utils";
import { ApiEvent } from "/imports/Api";

WebApp.handlers.use("/api", (_req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  return next();
});

const jsonSendResponder = async function (res: Response, process: () => Promise<ApiEvent[]>) {
  try {
    const body = {
      status: "success",
      data: await process(),
    };
    res.status(200).json(body);
  } catch (e) {
    const body: any = {};
    if (e instanceof FilteringReadError || e instanceof NoActionError) {
      res.status(400);
      body.status = "fail";
      body.data = {};
      if ((e as any).name) {
        body.data[(e as any).name] = e.message;
      } else {
        body.data.error = e.message;
      }
    } else {
      console.log(e, e instanceof Error && e.stack);
      res.status(500);
      body.status = "error";
      body.message = "Server error";
    }
    res.json(body);
  }
};

Router.route("api.0.json", {
  path: "/api/0/json/:handler",
  where: "server",
  async action() {
    await jsonSendResponder(this.response, () => orderedResults(this.params, this.params.handler));
  },
});
